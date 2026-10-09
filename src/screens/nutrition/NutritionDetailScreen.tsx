import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation';
import { useNutritionStore } from '../../store';
import { formatDate } from '../../hooks';

interface NutritionDetailScreenProps {
  navigation: NavigationProp<RootStackParamList, 'NutritionDetail'>;
  route: {
    params?: {
      date?: string;
    };
  };
}

export function NutritionDetailScreen({ navigation, route }: NutritionDetailScreenProps) {
  const { date } = route.params || {};
  const { entries, loadNutrition, getTodaysNutrition } = useNutritionStore();
  
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEntry = async () => {
      loadNutrition('current-user');
      if (date) {
        const e = entries.find((en: any) => en.date === date) || null;
        setEntry(e);
      } else {
        // Show today's entry
        const e = getTodaysNutrition('current-user') || entries[0] || null;
        setEntry(e);
      }
      setLoading(false);
    };
    loadEntry();
  }, [date, entries, loadNutrition, getTodaysNutrition]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Loading nutrition...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No nutrition data for this date</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const meals = entry.meals || [];
  const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'];
  const sortedMeals = meals.sort((a: any, b: any) => {
    return mealOrder.indexOf(a.type) - mealOrder.indexOf(b.type);
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerCard}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
            <Text style={styles.entryType}>Nutrition Log</Text>
          </View>

          <View style={styles.macroSummary}>
            <View style={styles.macroCard}>
              <Text style={styles.macroLabel}>Calories</Text>
              <Text style={styles.macroValue}>{entry.totalCalories}</Text>
              <Text style={styles.macroUnit}>kcal</Text>
            </View>
            <View style={styles.macroCard}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>{entry.totalProtein}</Text>
              <Text style={styles.macroUnit}>g</Text>
            </View>
            <View style={styles.macroCard}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>{entry.totalCarbs}</Text>
              <Text style={styles.macroUnit}>g</Text>
            </View>
            <View style={styles.macroCard}>
              <Text style={styles.macroLabel}>Fat</Text>
              <Text style={styles.macroValue}>{entry.totalFat}</Text>
              <Text style={styles.macroUnit}>g</Text>
            </View>
          </View>

          <View style={styles.extraMacros}>
            <View style={styles.extraMacro}>
              <Text style={styles.extraMacroLabel}>Fiber</Text>
              <Text style={styles.extraMacroValue}>{entry.totalFiber}g</Text>
            </View>
            <View style={styles.extraMacro}>
              <Text style={styles.extraMacroLabel}>Water</Text>
              <Text style={styles.extraMacroValue}>{entry.waterMl} ml</Text>
            </View>
          </View>
        </View>

        {/* Meals */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Meals ({meals.length})</Text>
          
          {sortedMeals.length === 0 ? (
            <View style={styles.emptyMeals}>
              <Text style={styles.emptyMealsText}>No meals logged</Text>
            </View>
          ) : (
            <FlatList
              data={sortedMeals}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.mealCard}>
                  <View style={styles.mealHeader}>
                    <View style={styles.mealTypeBadge}>
                      <Text style={styles.mealTypeIcon}>{getMealIcon(item.type)}</Text>
                    </View>
                    <View style={styles.mealTypeInfo}>
                      <Text style={styles.mealTypeName}>{getMealName(item.type)}</Text>
                      <Text style={styles.mealTypeMacros}>
                        {item.totalCalories} kcal • P:{item.totalProtein}g C:{item.totalCarbs}g F:{item.totalFat}g
                      </Text>
                    </View>
                  </View>

                  <FlatList
                    data={item.foods}
                    keyExtractor={(food) => food.id}
                    renderItem={({ item: food }) => (
                      <View style={styles.foodItem}>
                        <View style={styles.foodInfo}>
                          <Text style={styles.foodName}>{food.name}</Text>
                          <Text style={styles.foodAmount}>
                            {food.amount} {food.unit}
                          </Text>
                        </View>
                        <View style={styles.foodMacros}>
                          <Text style={styles.foodCalories}>{food.calories} kcal</Text>
                          <Text style={styles.foodProtein}>P:{food.protein}g</Text>
                        </View>
                      </View>
                    )}
                    ItemSeparatorComponent={() => <View style={styles.foodSeparator} />}
                    ListHeaderComponent={<View style={{ height: 8 }} />}
                    ListFooterComponent={<View style={{ height: 8 }} />}
                  />
                </View>
              )}
              ItemSeparatorComponent={() => <View style={styles.mealSeparator} />}
              ListHeaderComponent={<View style={{ height: 8 }} />}
              ListFooterComponent={<View style={{ height: 24 }} />}
            />
          )}
        </View>

        {/* Daily Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Daily Summary</Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Calories</Text>
              <Text style={styles.summaryValue}>{entry.totalCalories}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Protein</Text>
              <Text style={styles.summaryValue}>{entry.totalProtein}g</Text>
              <Text style={styles.summarySub}>{Math.round(entry.totalProtein * 4 / entry.totalCalories * 100)}%</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Carbs</Text>
              <Text style={styles.summaryValue}>{entry.totalCarbs}g</Text>
              <Text style={styles.summarySub}>{Math.round(entry.totalCarbs * 4 / entry.totalCalories * 100)}%</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Fat</Text>
              <Text style={styles.summaryValue}>{entry.totalFat}g</Text>
              <Text style={styles.summarySub}>{Math.round(entry.totalFat * 9 / entry.totalCalories * 100)}%</Text>
            </View>
          </View>
        </View>

        {/* History */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent Days ({entries.length})</Text>
          
          <FlatList
            data={entries.slice(0, 14)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.historyItem}
                onPress={() => navigation.navigate('NutritionDetail', { date: item.date })}
                activeOpacity={0.7}
              >
                <View style={styles.historyDate}>
                  <Text style={styles.historyDateText}>{formatDate(item.date)}</Text>
                  <Text style={styles.historyDateSub}>
                    {item.meals.length} meals
                  </Text>
                </View>
                <View style={styles.historyStats}>
                  <Text style={styles.historyStat}>
                    {item.totalCalories} kcal
                  </Text>
                  <Text style={styles.historyStat}>
                    P:{item.totalProtein} C:{item.totalCarbs} F:{item.totalFat}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.historySeparator} />}
            ListHeaderComponent={<View style={{ height: 8 }} />}
            ListFooterComponent={<View style={{ height: 24 }} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getMealIcon(type: string): string {
  const icons: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍪',
    pre_workout: '⚡',
    post_workout: '🔋',
  };
  return icons[type] || '🍽';
}

function getMealName(type: string): string {
  const names: Record<string, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
    pre_workout: 'Pre-Workout',
    post_workout: 'Post-Workout',
  };
  return names[type] || type;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 16,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 12,
  },
  entryDate: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  entryType: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  macroSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 8,
    marginBottom: 16,
  },
  macroCard: {
    alignItems: 'center',
    minWidth: 70,
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  macroUnit: {
    fontSize: 11,
    color: '#94A3B8',
  },
  extraMacros: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  extraMacro: {
    alignItems: 'center',
  },
  extraMacroLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  extraMacroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  emptyMeals: {
    padding: 32,
    alignItems: 'center',
  },
  emptyMealsText: {
    fontSize: 15,
    color: '#64748B',
  },
  mealCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  mealTypeBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealTypeIcon: {
    fontSize: 20,
  },
  mealTypeInfo: {
    flex: 1,
  },
  mealTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  mealTypeMacros: {
    fontSize: 12,
    color: '#64748B',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  foodAmount: {
    fontSize: 13,
    color: '#64748B',
  },
  foodMacros: {
    flexDirection: 'row',
    gap: 12,
  },
  foodCalories: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  foodProtein: {
    fontSize: 13,
    color: '#64748B',
  },
  foodSeparator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  mealSeparator: {
    height: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  summarySub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  historyDate: {
    minWidth: 100,
  },
  historyDateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  historyDateSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  historyStats: {
    flexDirection: 'column',
    gap: 4,
  },
  historyStat: {
    fontSize: 13,
    color: '#64748B',
  },
  historySeparator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
});