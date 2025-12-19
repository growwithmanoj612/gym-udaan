// // app/diet-plans.tsx
// import { Card } from "@/components/ui/card";
// import { Colors } from "@/constants/color";
// import { dietPlans } from "@/data/members";
// import { useColorScheme } from "@/hooks/use-color-scheme";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter } from "expo-router";
// import {
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

// const AnimatedCard = Animated.createAnimatedComponent(Card);

// export default function DietPlans() {
//   const router = useRouter();
//   const colorScheme = useColorScheme();
//   const colors = Colors[colorScheme ?? "light"];

//   const plan = dietPlans.data[0];

//   const getMealIcon = (mealType: string) => {
//     switch (mealType) {
//       case "Breakfast":
//         return "sunny";
//       case "Lunch":
//         return "pizza";
//       case "Dinner":
//         return "moon";
//       default:
//         return "nutrition";
//     }
//   };

//   const getMealColor = (mealType: string) => {
//     switch (mealType) {
//       case "Breakfast":
//         return "#F59E0B";
//       case "Mid-Morning Snack":
//         return "#10B981";
//       case "Lunch":
//         return "#EF4444";
//       case "Evening Snack":
//         return "#8B5CF6";
//       case "Dinner":
//         return "#3B82F6";
//       default:
//         return colors.primary;
//     }
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       {/* Header */}
//       <Animated.View
//         entering={FadeInUp.springify()}
//         style={[styles.header, { backgroundColor: colors.card }]}
//       >
//         <TouchableOpacity
//           onPress={() => router.back()}
//           style={styles.backButton}
//         >
//           <Ionicons name="arrow-back" size={24} color={colors.text} />
//         </TouchableOpacity>
//         <Text style={[styles.headerTitle, { color: colors.text }]}>
//           Diet Plans
//         </Text>
//         <View style={{ width: 40 }} />
//       </Animated.View>

//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Plan Overview */}
//         <Animated.View
//           entering={FadeInDown.delay(100).springify()}
//           style={styles.overviewContainer}
//         >
//           <Card gradient style={styles.overviewCard}>
//             <Text style={styles.planName}>{plan.planName}</Text>
//             <Text style={styles.planDescription}>{plan.description}</Text>

//             <View style={styles.planStats}>
//               <View style={styles.planStatItem}>
//                 <Ionicons name="calendar" size={20} color="#FFFFFF" />
//                 <Text style={styles.planStatValue}>{plan.duration}</Text>
//               </View>
//               <View style={styles.planStatItem}>
//                 <Ionicons name="flame" size={20} color="#FFFFFF" />
//                 <Text style={styles.planStatValue}>
//                   {plan.calories} cal/day
//                 </Text>
//               </View>
//               <View style={styles.planStatItem}>
//                 <Ionicons name="restaurant" size={20} color="#FFFFFF" />
//                 <Text style={styles.planStatValue}>
//                   {plan.meals.length} meals
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.trainerInfo}>
//               <Ionicons
//                 name="person-circle"
//                 size={16}
//                 color="rgba(255,255,255,0.9)"
//               />
//               <Text style={styles.trainerText}>
//                 Assigned by {plan.assignedBy}
//               </Text>
//             </View>
//           </Card>
//         </Animated.View>

//         {/* Daily Calories Breakdown */}
//         <AnimatedCard
//           entering={FadeInDown.delay(200).springify()}
//           elevated
//           style={styles.caloriesCard}
//         >
//           <Text style={[styles.cardTitle, { color: colors.text }]}>
//             Daily Calorie Breakdown
//           </Text>

//           <View style={styles.caloriesBar}>
//             <LinearGradient
//               colors={[colors.gradientStart, colors.gradientEnd]}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 0 }}
//               style={styles.caloriesProgress}
//             />
//           </View>

//           <View style={styles.macrosRow}>
//             <View style={styles.macroItem}>
//               <View style={[styles.macroDot, { backgroundColor: "#10B981" }]} />
//               <Text
//                 style={[styles.macroLabel, { color: colors.textSecondary }]}
//               >
//                 Protein
//               </Text>
//               <Text style={[styles.macroValue, { color: colors.text }]}>
//                 35%
//               </Text>
//             </View>
//             <View style={styles.macroItem}>
//               <View style={[styles.macroDot, { backgroundColor: "#F59E0B" }]} />
//               <Text
//                 style={[styles.macroLabel, { color: colors.textSecondary }]}
//               >
//                 Carbs
//               </Text>
//               <Text style={[styles.macroValue, { color: colors.text }]}>
//                 40%
//               </Text>
//             </View>
//             <View style={styles.macroItem}>
//               <View style={[styles.macroDot, { backgroundColor: "#EF4444" }]} />
//               <Text
//                 style={[styles.macroLabel, { color: colors.textSecondary }]}
//               >
//                 Fats
//               </Text>
//               <Text style={[styles.macroValue, { color: colors.text }]}>
//                 25%
//               </Text>
//             </View>
//           </View>
//         </AnimatedCard>

//         {/* Meal Plan */}
//         <View style={styles.section}>
//           <Text style={[styles.sectionTitle, { color: colors.text }]}>
//             Today's Meal Plan
//           </Text>

//           {plan.meals.map((meal, index) => (
//             <AnimatedCard
//               key={index}
//               entering={FadeInDown.delay(300 + index * 50).springify()}
//               elevated
//               style={styles.mealCard}
//             >
//               <View style={styles.mealHeader}>
//                 <View
//                   style={[
//                     styles.mealIcon,
//                     { backgroundColor: `${getMealColor(meal.mealType)}20` },
//                   ]}
//                 >
//                   <Ionicons
//                     name={getMealIcon(meal.mealType) as any}
//                     size={24}
//                     color={getMealColor(meal.mealType)}
//                   />
//                 </View>
//                 <View style={{ flex: 1 }}>
//                   <Text style={[styles.mealType, { color: colors.text }]}>
//                     {meal.mealType}
//                   </Text>
//                   <Text
//                     style={[styles.mealTime, { color: colors.textSecondary }]}
//                   >
//                     {meal.time}
//                   </Text>
//                 </View>
//                 <View style={styles.caloriesBadge}>
//                   <Ionicons name="flame" size={14} color={colors.primary} />
//                   <Text
//                     style={[styles.caloriesText, { color: colors.primary }]}
//                   >
//                     {meal.calories} cal
//                   </Text>
//                 </View>
//               </View>

//               <View style={styles.mealItems}>
//                 {meal.items.map((item, itemIndex) => (
//                   <View key={itemIndex} style={styles.mealItem}>
//                     <Ionicons
//                       name="checkmark-circle"
//                       size={16}
//                       color={colors.success}
//                     />
//                     <Text style={[styles.mealItemText, { color: colors.text }]}>
//                       {item}
//                     </Text>
//                   </View>
//                 ))}
//               </View>
//             </AnimatedCard>
//           ))}
//         </View>

//         {/* Tips Card */}
//         <AnimatedCard
//           entering={FadeInDown.delay(800).springify()}
//           style={[styles.tipsCard, { backgroundColor: `${colors.info}10` }]}
//         >
//           <View style={styles.tipsHeader}>
//             <Ionicons name="bulb" size={24} color={colors.info} />
//             <Text style={[styles.tipsTitle, { color: colors.info }]}>
//               Pro Tips
//             </Text>
//           </View>
//           <Text style={[styles.tipsText, { color: colors.text }]}>
//             • Drink at least 3-4 liters of water daily{"\n"}• Never skip
//             breakfast{"\n"}• Eat slowly and chew properly{"\n"}• Avoid processed
//             foods and sugary drinks
//           </Text>
//         </AnimatedCard>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//     paddingTop: 60,
//     paddingBottom: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   overviewContainer: {
//     padding: 20,
//   },
//   overviewCard: {
//     padding: 20,
//   },
//   planName: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#FFFFFF",
//     marginBottom: 8,
//   },
//   planDescription: {
//     fontSize: 14,
//     color: "rgba(255,255,255,0.9)",
//     marginBottom: 20,
//   },
//   planStats: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginBottom: 16,
//   },
//   planStatItem: {
//     alignItems: "center",
//     gap: 6,
//   },
//   planStatValue: {
//     fontSize: 12,
//     color: "#FFFFFF",
//     fontWeight: "600",
//   },
//   trainerInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     paddingTop: 16,
//     borderTopWidth: 1,
//     borderTopColor: "rgba(255,255,255,0.2)",
//   },
//   trainerText: {
//     fontSize: 12,
//     color: "rgba(255,255,255,0.9)",
//   },
//   caloriesCard: {
//     marginHorizontal: 20,
//     marginBottom: 20,
//     padding: 20,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 16,
//   },
//   caloriesBar: {
//     height: 8,
//     backgroundColor: "rgba(0,0,0,0.05)",
//     borderRadius: 4,
//     marginBottom: 16,
//     overflow: "hidden",
//   },
//   caloriesProgress: {
//     height: "100%",
//     width: "100%",
//   },
//   macrosRow: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//   },
//   macroItem: {
//     alignItems: "center",
//     gap: 4,
//   },
//   macroDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//   },
//   macroLabel: {
//     fontSize: 11,
//   },
//   macroValue: {
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   section: {
//     paddingHorizontal: 20,
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     marginBottom: 16,
//   },
//   mealCard: {
//     padding: 16,
//     marginBottom: 12,
//   },
//   mealHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   mealIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 12,
//   },
//   mealType: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 2,
//   },
//   mealTime: {
//     fontSize: 12,
//   },
//   caloriesBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     backgroundColor: "rgba(255,107,53,0.1)",
//     borderRadius: 8,
//   },
//   caloriesText: {
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   mealItems: {
//     gap: 8,
//   },
//   mealItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   mealItemText: {
//     fontSize: 14,
//     flex: 1,
//   },
//   tipsCard: {
//     marginHorizontal: 20,
//     marginBottom: 20,
//     padding: 16,
//     borderRadius: 16,
//   },
//   tipsHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginBottom: 12,
//   },
//   tipsTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   tipsText: {
//     fontSize: 14,
//     lineHeight: 22,
//   },
// });
