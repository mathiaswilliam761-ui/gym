import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useNutritionStore } from '../store';
import { MEAL_TYPES, FOOD_UNITS } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { useAuthStore } from '../store';

export function NutritionScreen() {
  const { entries, loadNutrition, addEntry, getTodaysNutrition } = useNutritionStore();
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadNutrition(user.id, selectedDate, selectedDate);
    }
  }, [user, selectedDate, loadNutrition]);

  const todaysNutrition = getTodaysNutrition(user?.id || '');
  const nutrition = todaysNutrition || entries[0];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nutrition</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>+ Log Food</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.datePicker}>
        <TouchableOpacity style={styles.dateButton} onPress={() => setSelectedDate(format(new Date(Date.now() - 86400000), 'yyyy-MM-dd'))}>
          <Text style={styles.dateButtonIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.dateText}>{format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setSelectedDate(format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'))}>
          <Text style={styles.dateButtonIcon}>›</Text>
        </TouchableOpacity>
      </View>

      {nutrition && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Daily Summary</Text>
          <View style={styles.macroBars}>
            <MacroBar label="Calories" value={nutrition.totalCalories} target={2500} unit="kcal" color="#DC2626" />
            <MacroBar label="Protein" value={nutrition.totalProtein} target={187} unit="g" color="#2563EB" />
            <MacroBar label="Carbs" value={nutrition.totalCarbs} target={250} unit="g" color="#D97706" />
            <MacroBar label="Fat" value={nutrition.totalFat} target={83} unit="g" color="#059669" />
          </View>
          <View style={styles.waterRow}>
            <Text style={styles.waterLabel}>Water</Text>
            <Text style={styles.waterValue}>{(nutrition.waterMl / 1000).toFixed(1)} / 3.0 L</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meals</Text>
        {nutrition && nutrition.meals.length > 0 ? (
          <FlatList
            data={nutrition.meals}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <MealCard meal={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.noMeals}>
            <Text style={styles.noMealsText}>No meals logged</Text>
            <Text style={styles.noMealsSubtitle}>Tap + Log Food to add a meal</Text>
          </View>
        )}
      </View>

      {showAddModal && (
        <AddFoodModal onClose={() => setShowAddModal(false)} onSave={data => { /* addEntry logic */ setShowAddModal(false); }} />
      )}
    </View>
  );
}

interface MacroBarProps {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}

function MacroBar({ label, value, target, unit, color }: MacroBarProps) {
  const progress = Math.min(value / target, 1);
  return (
    <View style={styles.macroBar}>
      <View style={styles.macroBarHeader}>
        <Text style={styles.macroBarLabel}>{label}</Text>
        <Text style={styles.macroBarValue}>{value}{unit} / {target}{unit}</Text>
      </View>
      <View style={styles.macroBarTrack}>
        <View style={[styles.macroBarFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

interface MealCardProps {
  meal: any;
}

function MealCard({ meal }: MealCardProps) {
  const mealType = MEAL_TYPES.find(m => m.id === meal.type);
  return (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={styles.mealType}>
          <Text style={styles.mealTypeIcon}>{mealType?.icon || '🍽️'}</Text>
          <Text style={styles.mealTypeName}>{mealType?.name || meal.type}</Text>
        </View>
        <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
      </View>
      <Text style={styles.mealName}>{meal.name}</Text>
      <View style={styles.mealMacros}>
        <Text style={styles.mealMacro}>P: {meal.protein}g</Text>
        <Text style={styles.mealMacro}>C: {meal.carbs}g</Text>
        <Text style={styles.mealMacro}>F: {meal.fat}g</Text>
      </View>
      {meal.foods && meal.foods.length > 0 && (
        <View style={styles.foodsList}>
          {meal.foods.map((food: any) => (
            <Text key={food.id} style={styles.foodItem}>
              {food.name} - {food.amount}{food.unit} ({food.calories} kcal)
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

interface AddFoodModalProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

function AddFoodModal({ onClose, onSave }: AddFoodModalProps) {
  const [mealType, setMealType] = useState('snack');
  const [foodName, setFoodName] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('g');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Log Food</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Meal Type</Text>
            <View style={styles.mealTypeSelector}>
              {MEAL_TYPES.map(mt => (
                <TouchableOpacity
                  key={mt.id}
                  style={[styles.mealTypeOption, mealType === mt.id && styles.mealTypeOptionSelected]}
                  onPress={() => setMealType(mt.id)}
                >
                  <Text style={styles.mealTypeOptionIcon}>{mt.icon}</Text>
                  <Text style={[styles.mealTypeOptionText, mealType === mt.id && styles.mealTypeOptionTextSelected]}>
                    {mt.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Food Name</Text>
            <TextInput style={styles.formInput} value={foodName} onChangeText={setFoodName} placeholder="e.g., Chicken Breast" />
          </View>
          <View style={styles.formRow}>
            <View style={styles.formGroupFlex}>
              <Text style={styles.formLabel}>Amount</Text>
              <TextInput style={styles.formInput} value={amount} onChangeText={setAmount} placeholder="100" keyboardType="decimal-pad" />
            </View>
            <View style={styles.formGroupFlex}>
              <Text style={styles.formLabel}>Unit</Text>
              <TextInput style={styles.formInput} value={unit} onChangeText={setUnit} placeholder="g" />
            </View>
          </View>
          <View style={styles.formRow}>
            <View style={styles.formGroupFlex}>
              <Text style={styles.formLabel}>Calories</Text>
              <TextInput style={styles.formInput} value={calories} onChangeText={setCalories} placeholder="165" keyboardType="numeric" />
            </View>
            <View style={styles.formGroupFlex}>
              <Text style={styles.formLabel}>Protein (g)</Text>
              <TextInput style={styles.formInput} value={protein} onChangeText={setProtein} placeholder="31" keyboardType="decimal-pad" />
            </View>
          </View>
          <View style={styles.formRow}>
            <View style={styles.formGroupFlex}>
              <Text style={styles.formLabel}>Carbs (g)</Text>
              <TextInput style={styles.formInput} value={carbs} onChangeText={setCarbs} placeholder="0" keyboardType="decimal-pad" />
            </View>
            <View style={styles.formGroupFlex}>
              <Text style={styles.formLabel}>Fat (g)</Text>
              <TextInput style={styles.formInput} value={fat} onChangeText={setFat} placeholder="3.6" keyboardType="decimal-pad" />
            </View>
          </View>
        </ScrollView>
        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalSave} onPress={() => onSave({
            mealType, foodName, amount: parseFloat(amount), unit, calories: parseInt(calories),
            protein: parseFloat(protein), carbs: parseFloat(carbs), fat: parseFloat(fat)
          })}>
            <Text style={styles.modalSaveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#0F172A' },
  addButton: { backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  datePicker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16 },
  dateButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 } },
  dateButtonIcon: { fontSize: 20, color: '#0F172A', fontWeight: '300' },
  dateText: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginHorizontal: 16, marginBottom: 16, ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 } },
  summaryTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  macroBars: { marginBottom: 16 },
  macroBar: { marginBottom: 12 },
  macroBarHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  macroBarLabel: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  macroBarValue: { fontSize: 13, color: '#64748B' },
  macroBarTrack: { height: 8, borderRadius: 4, backgroundColor: '#E2E8F0', overflow: 'hidden' },
  macroBarFill: { height: '100%', borderRadius: 4 },
  waterRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  waterLabel: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  waterValue: { fontSize: 16, color: '#64748B' },
  section: { marginBottom: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  listContent: { paddingBottom: 24 },
  mealCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 } },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  mealType: { flexDirection: 'row', alignItems: 'center' },
  mealTypeIcon: { fontSize: 20, marginRight: 8 },
  mealTypeName: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  mealCalories: { fontSize: 14, fontWeight: '600', color: '#2563EB' },
  mealName: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 8 },
  mealMacros: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  mealMacro: { fontSize: 13, color: '#64748B' },
  foodsList: { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 8 },
  foodItem: { fontSize: 13, color: '#94A3B8', marginBottom: 4 },
  noMeals: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24, alignItems: 'center', marginTop: 16, ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 } },
  noMealsText: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
  noMealsSubtitle: { fontSize: 14, color: '#64748B' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  modalClose: { fontSize: 24, color: '#94A3B8' },
  modalContent: { padding: 16 },
  formGroup: { marginBottom: 16 },
  formRow: { flexDirection: 'row', gap: 8 },
  formGroupFlex: { flex: 1 },
  formLabel: { fontSize: 14, fontWeight: '500', color: '#0F172A', marginBottom: 8 },
  formInput: { backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0' },
  mealTypeSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mealTypeOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  mealTypeOptionSelected: { backgroundColor: '#DBEAFE', borderColor: '#2563EB' },
  mealTypeOptionIcon: { fontSize: 16, marginRight: 6 },
  mealTypeOptionText: { fontSize: 13, fontWeight: '500', color: '#475569' },
  mealTypeOptionTextSelected: { color: '#2563EB' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  modalCancel: { flex: 1, paddingVertical: 12, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  modalCancelText: { fontSize: 16, fontWeight: '600', color: '#475569' },
  modalSave: { flex: 1, backgroundColor: '#2563EB', paddingVertical: 12, borderRadius: 8, marginLeft: 8, alignItems: 'center' },
  modalSaveText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});