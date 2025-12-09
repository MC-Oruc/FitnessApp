import React, { useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Path, G, Image as SvgImage } from 'react-native-svg';

type AnatomyRegion = {
  keyword: string;
  label: string;
};

type Props = {
  onSelectRegion?: (region: AnatomyRegion) => void;
  detailMode?: 'simple' | 'detailed';
};

type MuscleGroupProps = {
  paths: string[];
  fill: string;
  fillActive: string;
  onPress: () => void;
};

const AnimatedPath = Animated.createAnimatedComponent(Path);

// PNG tabanı: assets/anatomy/back/base_back.svg içinde referans verilen görsel
const BACK_BASE = require('../../assets/anatomy/back/base_back.png');

// ==================== PATH DEFINITIONS (Inkscape overlay) ====================

// Calves
const PATHS_SOLEUS = [
  // left + right Soleus
  'm 1294.328,3573.7425 12.1076,6.1531 17.8638,1.5878 15.2834,-3.9697 16.6728,-14.6879 -13.2985,-43.8655 8.9026,-120.2235 10.6666,-63.4385 35.9298,-261.6141 -14.5964,25.8246 -34.8071,-15.1579 -23.5789,-75.2281 -8.4211,53.8947 -24.7017,54.4562 -35.3684,27.5088 -28.6316,-7.8597 -46.5965,-74.6667 25.2631,121.2632 17.965,160.5614 23.5789,147.6491 z',
  'm 878.49954,3656.5112 19.84861,-5.1606 18.6577,-18.2608 -11.46199,-68.4582 -2.80702,-89.2632 10.38597,-119.2982 17.12281,-133.6141 8.42105,-48 -13.19298,-12.0701 -12.07018,-35.6492 -6.45614,-31.4385 -1.68421,-35.3685 -10.66667,37.6141 -13.75438,39.0175 -26.94737,24.4211 -37.61404,-3.9299 -28.63158,-39.0175 -35.92982,-60.0702 -38.73684,7.2983 37.61403,161.6842 43.78948,199.8596 42.10526,162.2456 z',
];

const PATHS_GASTROCNEMIUS = [
  // left + right Gastrocnemius
  'm 939.22807,3173.614 25.82456,-86.4561 5.89474,-52.7719 -4.21053,-77.7544 -15.43859,-90.1053 -24.70176,-99.0877 -43.50877,-126.0351 -82.52632,-12.9123 -54.45614,112.8421 -14.03508,35.9299 -33.12281,15.1579 -8.42105,68.4912 3.92982,154.386 19.64912,49.9649 37.05264,-7.2983 65.1228,99.3684 37.61404,2.8071 28.07017,-24.1404 23.57895,-76.9123 5.61404,61.7544 15.15789,40.4211 z',
  'm 1182.3158,3063.0175 47.1579,75.7895 28.0702,5.6141 35.9298,-26.9474 25.2631,-54.4562 6.7369,-55.5789 24.1403,76.9123 34.8071,14.5965 14.5964,-24.7018 18.5264,-90.9473 -3.3685,-81.965 -14.035,-65.1228 -30.8772,-84.7719 -27.5088,-70.7368 -9.5439,-30.3158 -34.2456,-60.0702 -65.6842,32.5614 -44.3509,124.6316 -22.4561,74.1052 -5.0526,70.7369 -1.1229,64.5614 z',
];

// Hamstrings
const PATHS_KNEE_FLEXORS = [
  'm 739.16229,2751.0175 -58.75189,-32.5517 -2.38183,-47.6366 -12.70311,-41.2852 5.55761,-92.8915 31.75777,-160.3767 60.33978,-6.3516 37.31539,258.8259 z',
  'm 1335.4146,2647.8048 -14.291,-192.1346 4.7636,-50.0185 -30.1698,-73.8368 -96.8613,24.6122 50.8125,171.4921 46.0488,63.5155 z',
];

const PATHS_HIP_EXTENSORS = [
  'm 883.66018,2643.0411 37.31539,104.8007 23.02439,-142.91 11.11522,-145.2919 50.81242,-294.5534 7.9395,-149.2615 -55.57614,22.2304 -77.80656,18.2607 -109.56433,-92.8915 -133.38267,-107.1825 -20.64256,129.413 -14.291,131.7948 2.38184,151.6434 12.70311,110.3582 30.16989,102.4189 23.02439,47.6366 32.55172,-153.2312 58.75189,-5.5577 37.31539,257.2381 z',
  'm 1124.2254,2716.8779 75.4247,-2.3818 31.7578,-90.5097 62.7216,-33.3456 -42.0791,-59.5459 -53.1943,-177.0496 96.0673,-23.0244 32.5517,77.0126 13.4971,-119.0916 3.1758,-109.5644 -10.3213,-132.5887 -4.7637,-86.5399 -19.8486,65.1034 -38.1093,12.7031 -80.9824,-3.1758 -68.2792,-15.8788 -65.1034,-39.6973 -42.0791,37.3154 -7.9394,149.2616 22.2304,108.7704 2.3818,81.7762 3.9698,70.6611 12.7031,66.6913 22.2304,61.1338 21.4365,33.3456 3.9698,38.9033 z',
];

// Glutes
const PATHS_GLUTE_MAX = [
  'm 880.84211,2055.8597 78.03508,-18.5264 54.45611,-22.4561 44.9123,-38.1754 39.8597,28.0701 25.8245,15.1579 61.7544,14.5965 84.2105,3.9298 39.2983,-13.4736 20.2105,-64.5614 4.4912,-61.193 -3.3684,-70.7369 -14.5965,-87.5789 -152.7017,-83.0877 -39.2983,1.6842 -19.0877,53.8947 -33.6842,-63.4386 -71.85965,-29.193 -44.91228,11.2281 -83.64913,52.7719 -51.64912,74.1053 -28.63158,63.4386 7.85965,75.7895 16.2807,57.2631 z',
];

const PATHS_GLUTE_MED_MIN = [
  'm 1315.3684,1739.7895 -21.8947,-111.7193 -40.4211,-90.9474 -24.1403,1.6842 -53.3334,42.1053 -46.5964,57.8245 -71.8597,-5.0526 -65.1228,-56.1403 -87.57895,-47.1579 -85.89473,-5.0527 -92.07018,30.3158 -43.22807,29.7544 -8.98245,50.5263 -13.47369,62.8772 130.24562,124.0702 32.5614,-72.4211 45.47368,-65.6842 87.01755,-55.5789 46.03512,-8.9825 70.1754,30.3158 33.1228,61.193 17.9649,-52.2105 40.4211,-1.6842 z',
];

// Shoulders
const PATHS_SIDE_SHOULDER = [
  'm 533.33333,1020.6316 33.68421,-22.45616 12.35088,-49.40351 29.19298,-87.57895 44.91228,-90.94737 42.66667,-53.89473 20.21053,-33.68421 -30.31579,-29.19299 -41.35219,11.85178 -54.3852,33.74263 -35.7275,48.03364 -22.23044,52.79731 -13.10008,57.95795 -1.19092,50.81244 5.95458,42.47603 10.32128,44.46089 z',
];

const PATHS_REAR_SHOULDER = [
  'M 911.1579,759.01755 870.17544,721.40351 814.59649,697.26316 762.94737,690.52632 696.14035,716.35088 654.59649,768.5614 602.38597,878.03509 576,962.24562 l -5.61403,27.50877 38.73684,-35.92983 89.82456,-42.66666 60.07018,-29.75439 58.38596,-40.98246 50.52632,-53.33333 17.4035,-21.89474 z',
  'm 1300.084,769.33218 c 1.5879,-1.98486 28.979,-28.582 28.979,-28.582 l 29.376,-30.96383 -0.794,-21.43651 41.2851,13.10009 32.5518,19.84861 24.2153,25.40622 26.2001,36.12448 16.6729,40.09419 14.291,52.40033 1.9848,41.28512 -1.5879,53.59125 -48.8275,-44.06392 -28.582,-18.26072 -40.4912,-52.00336 -57.164,-67.88226 z',
];

// Triceps
const PATHS_TRICEPS_LONG = [
  'm 610.80702,1429.8947 43.78947,-50.5263 10.66667,-51.6491 51.08772,-129.1228 12.91228,-38.1754 23.57895,-53.8948 8.42105,-62.3158 -0.5614,-52.7719 -1.68421,-108.91228 -84.77193,39.85965 -19.64913,48.2807 -17.40351,76.91223 -15.71929,72.4211 28.63157,30.3158 -7.29824,61.7544 -38.17544,145.4035 z',
  'm 1526.4561,1400.1404 -1.1228,-38.7369 8.9825,-17.9649 -33.1228,-101.0526 10.6667,-91.5088 10.6666,-29.193 -93.193,-218.38595 -21.3333,65.68421 -14.0351,71.85964 -23.0175,69.0526 -35.9299,94.8772 24.7018,79.1579 42.6667,70.7369 z',
];

const PATHS_TRICEPS_LATERAL_MEDIAL = [
  'm 675.36842,922.94737 -69.61403,32.5614 -34.80702,34.80702 -11.78947,13.47371 -33.68421,22.4561 -14.5965,57.2632 -26.38596,107.7894 -11.22807,70.7369 71.85965,122.9474 60.63158,37.0526 -1.12281,-65.1228 38.17544,-143.1579 7.29824,-63.4386 -28.63157,-29.7544 28.07017,-126.87719 z',
  'm 1512.9825,971.22807 27.5087,65.68423 17.9649,65.1228 5.6141,106.1053 4.4912,58.9473 13.4737,65.1228 9.5438,28.6316 v 37.614 l -64.5614,1.6843 -2.807,-39.2983 11.2281,-17.4035 -34.807,-101.614 11.7895,-93.193 10.6666,-26.386 -92.0702,-220.07016 z',
];

// Forearms
const PATHS_FOREARMS_FLEXORS = [
  'm 657.38601,1379.8755 c -0.79394,3.1757 -45.25483,49.2245 -45.25483,49.2245 l -40.49117,-27.788 -148.46761,365.2144 44.46089,25.4062 78.6005,-130.2069 55.57611,-86.5399 32.55172,-81.7763 z',
  'm 1545.8099,1761.7628 8.7333,-209.6014 -12.7031,-151.6434 -15.8789,-0.7939 -123.8553,-44.4609 3.9697,29.3759 -3.9697,90.5097 3.9697,72.2489 15.8789,60.3398 11.1152,86.54 v 52.4003 z',
];

const PATHS_FOREARMS_EXTENSORS = [
  'm 472.39695,1265.5475 -53.98822,96.8612 -18.26072,65.1034 -14.291,123.0614 -8.73339,102.4189 -15.87889,82.5702 60.33978,30.1699 87.33389,-199.2801 62.72161,-165.9344 -26.99411,-16.6728 z',
  'm 1541.8401,1399.7241 50.8125,-2.3819 v 39.6973 l 5.5576,42.079 -3.1758,69.0732 -19.8486,101.6249 -18.2607,113.534 -10.3213,-1.5878 9.5273,-211.1893 z',
];

const PATHS_FOREARMS_PRONATOR_SUP = [
  'm 342.19006,1799.0781 25.40622,23.8184 53.19428,12.7031 34.93356,-0.794 13.49705,-42.873 -108.77039,-55.5761 z',
  'm 1433.0697,1746.6778 -15.8788,82.5702 49.2245,23.0244 75.4247,-0.7939 11.9092,-37.3154 3.1758,-51.6064 z',
];

// Back
const PATHS_ERECTOR_SPINAE = [
  'm 894.87719,1531.5088 39.29825,-142.5965 56.14035,-47.1579 43.78951,-47.1579 29.1929,-62.8772 20.2106,66.2456 37.0526,-47.1579 8.9825,-16.8421 8.9824,64 26.9474,55.0176 31.4386,42.6666 -11.2281,52.772 38.1755,90.9473 1.1966,3.2657 -49.82,38.3078 -46.2473,58.3549 -72.4474,-5.1606 -65.10346,-57.164 -87.1354,-46.4458 z',
];

const PATHS_LOWER_LATS = [
  'm 887.6299,1528.7401 8.33642,1.1909 37.71236,-140.9252 62.72161,-53.9882 38.10931,-40.4912 29.7729,-65.8974 -38.0369,-122.6641 -131.36841,1.1228 -131.36842,-53.8947 -14.59649,67.3684 -25.82456,59.5088 92.07018,220.0702 z',
  'm 1195.6804,1117.8738 172.2859,-7.1455 -31.7578,88.9218 -61.9276,130.2069 -21.4365,70.661 -3.1758,34.9336 3.9697,39.6972 1.5879,61.1337 -30.1699,3.9697 -39.6972,-92.8915 11.9091,-53.1942 -31.7577,-39.6973 -28.582,-58.7518 -6.3516,-62.7217 z',
];

const PATHS_UPPER_LATS_TERES = [
  'm 759.80485,882.07229 79.39444,-55.57611 47.63667,-61.92767 25.40622,-2.38183 37.31539,75.42472 34.93356,110.35828 14.291,69.07312 26.99407,87.3339 -132.58869,3.9698 -129.41294,-53.9883 -0.79395,-82.57018 z',
  'm 1195.6804,1117.0799 173.0798,-5.5577 26.9942,-84.1581 11.9091,-63.51553 20.6426,-62.72161 -53.9882,-66.69134 -35.7275,-46.04877 -39.6973,-19.84862 -7.9394,74.63078 -17.4668,88.12784 -25.4062,71.45495 -24.6123,64.3096 z',
];

const PATHS_LOWER_TRAP = [
  'm 1084.5281,1294.9234 45.2549,-61.9277 46.0487,-81.7762 56.3701,-106.3886 33.3457,-96.06727 15.8789,-55.57612 -159.5829,-42.07905 -150.05548,50.81244 26.99411,108.7704 34.93357,112.7401 29.3759,107.1825 z',
];

const PATHS_MIDDLE_TRAP = [
  'm 884.45413,710.58029 50.81244,91.30361 39.69722,100.83095 146.87971,-50.81245 158.7889,41.28511 17.4668,-124.64928 26.9941,-64.3095 -225.4802,-54.78216 z',
];

const PATHS_UPPER_TRAP = [
  'm 1346.2456,683.78947 -20.2105,21.33334 -226.807,-53.89474 -217.82459,59.50877 -95.4386,-39.29824 -64,-23.57895 105.54386,-57.26316 98.80702,-55.01754 69.61404,-179.64913 6.73687,-19.08771 23.5789,7.85964 13.4737,22.45615 33.6842,2.24561 15.7193,-22.45614 15.7193,4.49123 12.3509,23.57894 -2.2456,52.77193 5.614,48.28071 17.9649,50.52631 26.9474,28.07018 52.7719,37.05263 51.6491,30.31579 z',
];

function MuscleGroup({ paths, fill, fillActive, onPress }: MuscleGroupProps) {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const isPressed = useRef(false);

  const handleGrant = () => {
    isPressed.current = true;
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleRelease = () => {
    if (!isPressed.current) return;
    isPressed.current = false;

    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 80,
      useNativeDriver: false,
    }).start();

    setTimeout(() => {
      onPress();
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }, 150);
  };

  const handleTerminate = () => {
    isPressed.current = false;
    Animated.timing(glowAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  return (
    <G
      onStartShouldSetResponder={() => true}
      onResponderGrant={handleGrant}
      onResponderRelease={handleRelease}
      onResponderTerminate={handleTerminate}
    >
      {paths.map((d, i) => (
        <React.Fragment key={i}>
            {/* Base Layer (Gradient) */}
            <Path d={d} fill={fill} />
            {/* Active Overlay (Solid Color with Opacity) */}
            <AnimatedPath
                d={d}
                fill={fillActive}
                opacity={glowAnim}
                stroke={fillActive}
                strokeWidth="1.5"
                strokeOpacity={glowAnim}
            />
        </React.Fragment>
      ))}
    </G>
  );
}

export default function AnatomySvgBack({
  onSelectRegion,
  detailMode = 'simple',
}: Props) {
  const isDetailed = detailMode === 'detailed';

  return (
    <View style={styles.container}>
      <Svg width={280} height={580} viewBox="0 0 1962.6667 3840">
        {/* PNG tabanı */}
        <SvgImage
          href={BACK_BASE}
          x={0}
          y={0}
          width={1962.6667}
          height={3840}
          preserveAspectRatio="xMidYMid meet"
        />

        {/* INTERACTIVE MUSCLE REGIONS (Inkscape overlay path'leri) */}

        {/* Trapezius */}
        {isDetailed ? (
          <>
            <MuscleGroup
              paths={PATHS_UPPER_TRAP}
              fill="#ffffff01"
              fillActive="#3b82f680"
              onPress={() =>
                onSelectRegion?.({ keyword: 'Upper Trap', label: 'Üst Trapez' })
              }
            />
            <MuscleGroup
              paths={PATHS_MIDDLE_TRAP}
              fill="#ffffff01"
              fillActive="#60a5fa80"
              onPress={() =>
                onSelectRegion?.({ keyword: 'Middle Trap', label: 'Orta Trapez' })
              }
            />
            <MuscleGroup
              paths={PATHS_LOWER_TRAP}
              fill="#ffffff01"
              fillActive="#93c5fd80"
              onPress={() =>
                onSelectRegion?.({ keyword: 'Lower Trap', label: 'Alt Trapez' })
              }
            />
          </>
        ) : (
          <MuscleGroup
            paths={[...PATHS_UPPER_TRAP, ...PATHS_MIDDLE_TRAP, ...PATHS_LOWER_TRAP]}
            fill="#ffffff01"
            fillActive="#3b82f680"
            onPress={() => onSelectRegion?.({ keyword: 'Back', label: 'Trapez' })}
          />
        )}

        {/* Rear / Side Shoulder */}
        <MuscleGroup
          paths={[...PATHS_REAR_SHOULDER, ...PATHS_SIDE_SHOULDER]}
          fill="#ffffff01"
          fillActive="#a855f780"
          onPress={() =>
            onSelectRegion?.({ keyword: 'Rear Shoulder', label: 'Arka Omuz' })
          }
        />

        {/* Lats */}
        {isDetailed ? (
          <>
            <MuscleGroup
              paths={PATHS_UPPER_LATS_TERES}
              fill="#ffffff01"
              fillActive="#3b82f680"
              onPress={() =>
                onSelectRegion?.({
                  keyword: 'Upper Lats & Teres Major',
                  label: 'Üst Lat',
                })
              }
            />
            <MuscleGroup
              paths={PATHS_LOWER_LATS}
              fill="#ffffff01"
              fillActive="#60a5fa80"
              onPress={() =>
                onSelectRegion?.({ keyword: 'Lower Lats', label: 'Alt Lat' })
              }
            />
          </>
        ) : (
          <MuscleGroup
            paths={[...PATHS_UPPER_LATS_TERES, ...PATHS_LOWER_LATS]}
            fill="#ffffff01"
            fillActive="#3b82f680"
            onPress={() =>
              onSelectRegion?.({ keyword: 'Back', label: 'Sırt (Kanat)' })
            }
          />
        )}

        {/* Triceps */}
        {isDetailed ? (
          <>
            <MuscleGroup
              paths={PATHS_TRICEPS_LONG}
              fill="#ffffff01"
              fillActive="#eab30880"
              onPress={() =>
                onSelectRegion?.({
                  keyword: 'Triceps Long Head',
                  label: 'Triseps (Uzun Baş)',
                })
              }
            />
            <MuscleGroup
              paths={PATHS_TRICEPS_LATERAL_MEDIAL}
              fill="#ffffff01"
              fillActive="#fbbf2480"
              onPress={() =>
                onSelectRegion?.({
                  keyword: 'Triceps Lateral & Medial',
                  label: 'Triseps (Yan & İç)',
                })
              }
            />
          </>
        ) : (
          <MuscleGroup
            paths={[...PATHS_TRICEPS_LONG, ...PATHS_TRICEPS_LATERAL_MEDIAL]}
            fill="#ffffff01"
            fillActive="#eab30880"
            onPress={() => onSelectRegion?.({ keyword: 'Triceps', label: 'Triseps' })}
          />
        )}

        {/* Forearms */}
        {isDetailed ? (
          <>
            <MuscleGroup
              paths={PATHS_FOREARMS_FLEXORS}
              fill="#ffffff01"
              fillActive="#a855f780"
              onPress={() =>
                onSelectRegion?.({ keyword: 'Flexors', label: 'Ön Kol (Flexors)' })
              }
            />
            <MuscleGroup
              paths={PATHS_FOREARMS_EXTENSORS}
              fill="#ffffff01"
              fillActive="#c084fc80"
              onPress={() =>
                onSelectRegion?.({ keyword: 'Extensors', label: 'Ön Kol (Extensors)' })
              }
            />
            <MuscleGroup
              paths={PATHS_FOREARMS_PRONATOR_SUP}
              fill="#ffffff01"
              fillActive="#d8b4fe80"
              onPress={() =>
                onSelectRegion?.({
                  keyword: 'Pronator & Supinator',
                  label: 'Pronator & Supinator',
                })
              }
            />
          </>
        ) : (
          <MuscleGroup
            paths={[
              ...PATHS_FOREARMS_FLEXORS,
              ...PATHS_FOREARMS_EXTENSORS,
              ...PATHS_FOREARMS_PRONATOR_SUP,
            ]}
            fill="#ffffff01"
            fillActive="#eab30880"
            onPress={() =>
              onSelectRegion?.({ keyword: 'Forearms', label: 'Ön Kol' })
            }
          />
        )}

        {/* Erector Spinae */}
        <MuscleGroup
          paths={PATHS_ERECTOR_SPINAE}
          fill="#ffffff01"
          fillActive="#f9731680"
          onPress={() =>
            onSelectRegion?.({ keyword: 'Erector Spinae', label: 'Erector Spinae' })
          }
        />

        {/* Glutes */}
        {isDetailed ? (
          <>
            <MuscleGroup
              paths={PATHS_GLUTE_MAX}
              fill="#ffffff01"
              fillActive="#ec489980"
              onPress={() =>
                onSelectRegion?.({
                  keyword: 'Gluteus Maximus',
                  label: 'Gluteus Maximus',
                })
              }
            />
            <MuscleGroup
              paths={PATHS_GLUTE_MED_MIN}
              fill="#ffffff01"
              fillActive="#f472b680"
              onPress={() =>
                onSelectRegion?.({
                  keyword: 'Gluteus Medius & Minimus',
                  label: 'Gluteus Medius',
                })
              }
            />
          </>
        ) : (
          <MuscleGroup
            paths={[...PATHS_GLUTE_MAX, ...PATHS_GLUTE_MED_MIN]}
            fill="#ffffff01"
            fillActive="#ec489980"
            onPress={() => onSelectRegion?.({ keyword: 'Glutes', label: 'Kalça' })}
          />
        )}

        {/* Hamstrings */}
        {isDetailed ? (
          <>
            <MuscleGroup
              paths={PATHS_HIP_EXTENSORS}
              fill="#ffffff01"
              fillActive="#00d4aa80"
              onPress={() =>
                onSelectRegion?.({ keyword: 'Hip Extensors', label: 'Hamstring (Üst)' })
              }
            />
            <MuscleGroup
              paths={PATHS_KNEE_FLEXORS}
              fill="#ffffff01"
              fillActive="#34d39980"
              onPress={() =>
                onSelectRegion?.({
                  keyword: 'Knee Flexors',
                  label: 'Hamstring (Alt)',
                })
              }
            />
          </>
        ) : (
          <MuscleGroup
            paths={[...PATHS_HIP_EXTENSORS, ...PATHS_KNEE_FLEXORS]}
            fill="#ffffff01"
            fillActive="#00d4aa80"
            onPress={() =>
              onSelectRegion?.({ keyword: 'Hamstrings', label: 'Arka Bacak' })
            }
          />
        )}

        {/* Calves */}
        {isDetailed ? (
          <>
            <MuscleGroup
              paths={PATHS_GASTROCNEMIUS}
              fill="#ffffff01"
              fillActive="#00d4aa80"
              onPress={() =>
                onSelectRegion?.({
                  keyword: 'Gastrocnemius',
                  label: 'Gastrocnemius',
                })
              }
            />
            <MuscleGroup
              paths={PATHS_SOLEUS}
              fill="#ffffff01"
              fillActive="#34d39980"
              onPress={() =>
                onSelectRegion?.({ keyword: 'Soleus', label: 'Soleus' })
              }
            />
          </>
        ) : (
          <MuscleGroup
            paths={[...PATHS_GASTROCNEMIUS, ...PATHS_SOLEUS]}
            fill="#ffffff01"
            fillActive="#00d4aa80"
            onPress={() => onSelectRegion?.({ keyword: 'Calves', label: 'Baldır' })}
          />
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
