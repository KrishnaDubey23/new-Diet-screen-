import * as React from "react";
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, StatusBar, Modal, TextInput, Alert, Platform, Pressable, Image } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Calendar, DateData } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import DietScreen from "./diet1";

// Enhanced color palette for dark theme
const colors = {
  primary: "#FFA500",
  primaryLight: "rgba(244, 117, 81, 0.15)",
  background: "#fff",
  text: "#222",
  textLight: "#888",
  cardBg: "#fff",
  progressBg: "#F7F7F7",
  carbs: "#FF4B55",
  protein: "#FFA500",
  fat: "#A45EE5",
  border: "#E0E0E0",
  accent: "#FFA500",
  calendarSelected: "#FFA500",
  dotIndicator: "#FFA500",
  cardShadow: "rgba(0, 0, 0, 0.08)",
  mealItemBg: "#fff",
  navigationBg: "#fff"
};

interface MealData {
  id: string;
  name: string;
  calories: number;
  macros?: {
    carbs: number;
    protein: number;
    fat: number;
  };
  portions?: string;
  isPlanned: boolean;
  icon: string;
  isExpanded?: boolean;
  items: Array<{
    id: string;
    name: string;
    calories: number;
    macros: {
      carbs: number;
      protein: number;
      fat: number;
    };
    portions: string;
  }>;
}

// Add a type for the week day object
interface WeekDay {
  label: string;
  date: number;
  isToday: boolean;
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const getCurrentWeekDates = (): WeekDay[] => {
  const today = new Date();
  const week: WeekDay[] = [];
  // Get the index of the current day (0=Sunday, 1=Monday, ..., 6=Saturday)
  const currentDay = today.getDay();
  // Go to the start of the week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay);
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    week.push({
      label: DAYS[i],
      date: day.getDate(),
      isToday: day.toDateString() === today.toDateString()
    });
  }
  return week;
};

const CURRENT_WEEK: WeekDay[] = getCurrentWeekDates();

const DEFAULT_DAILY_CALORIES = 2500;
const DEFAULT_DAILY_MACROS = {
  carbs: { target: 300 },
  protein: { target: 150 },
  fat: { target: 80 }
};

const FOOD_LIST = {
  breakfast: [
    {
      id: 'b1',
      name: 'Classic Breakfast',
      items: [
        { name: 'Scrambled Eggs', calories: 140, portion: '2 eggs' },
        { name: 'Whole Wheat Toast', calories: 70, portion: '1 slice' },
        { name: 'Avocado', calories: 80, portion: '1/2 fruit' }
      ],
      totalCalories: 290,
      image: '🍳'
    },
    {
      id: 'b2',
      name: 'Healthy Bowl',
      items: [
        { name: 'Greek Yogurt', calories: 100, portion: '1 cup' },
        { name: 'Granola', calories: 120, portion: '1/4 cup' },
        { name: 'Mixed Berries', calories: 50, portion: '1/2 cup' }
      ],
      totalCalories: 270,
      image: '🥣'
    },
    {
      id: 'b3',
      name: 'Quick Start',
      items: [
        { name: 'Banana', calories: 105, portion: '1 medium' },
        { name: 'Peanut Butter', calories: 95, portion: '1 tbsp' },
        { name: 'Honey', calories: 60, portion: '1 tbsp' }
      ],
      totalCalories: 260,
      image: '🍌'
    }
  ],
  lunch: [
    {
      id: 'l1',
      name: 'Grilled Chicken Salad',
      items: [
        { name: 'Grilled Chicken', calories: 165, portion: '100g' },
        { name: 'Mixed Greens', calories: 10, portion: '2 cups' },
        { name: 'Olive Oil Dressing', calories: 120, portion: '1 tbsp' }
      ],
      totalCalories: 295,
      image: '🥗'
    },
    {
      id: 'l2',
      name: 'Veggie Wrap',
      items: [
        { name: 'Whole Wheat Tortilla', calories: 120, portion: '1 piece' },
        { name: 'Hummus', calories: 70, portion: '2 tbsp' },
        { name: 'Mixed Vegetables', calories: 30, portion: '1 cup' }
      ],
      totalCalories: 220,
      image: '🌯'
    },
    {
      id: 'l3',
      name: 'Protein Bowl',
      items: [
        { name: 'Quinoa', calories: 120, portion: '1/2 cup' },
        { name: 'Black Beans', calories: 110, portion: '1/2 cup' },
        { name: 'Sweet Potato', calories: 90, portion: '1/2 cup' }
      ],
      totalCalories: 320,
      image: '🥘'
    }
  ],
  dinner: [
    {
      id: 'd1',
      name: 'Salmon Dinner',
      items: [
        { name: 'Grilled Salmon', calories: 200, portion: '150g' },
        { name: 'Brown Rice', calories: 110, portion: '1/2 cup' },
        { name: 'Steamed Broccoli', calories: 30, portion: '1 cup' }
      ],
      totalCalories: 340,
      image: '🐟'
    },
    {
      id: 'd2',
      name: 'Vegetarian Pasta',
      items: [
        { name: 'Whole Wheat Pasta', calories: 180, portion: '1 cup' },
        { name: 'Tomato Sauce', calories: 70, portion: '1/2 cup' },
        { name: 'Mixed Vegetables', calories: 50, portion: '1 cup' }
      ],
      totalCalories: 300,
      image: '🍝'
    },
    {
      id: 'd3',
      name: 'Stir Fry',
      items: [
        { name: 'Tofu', calories: 140, portion: '150g' },
        { name: 'Mixed Vegetables', calories: 60, portion: '1.5 cups' },
        { name: 'Brown Rice', calories: 110, portion: '1/2 cup' }
      ],
      totalCalories: 310,
      image: '🥢'
    }
  ],
  eveningsnacks: [
    {
      id: 'es1',
      name: 'Healthy Snacks',
      items: [
        { name: 'Mixed Nuts', calories: 160, portion: '30g' },
        { name: 'Green Tea', calories: 0, portion: '1 cup' },
        { name: 'Fruit Mix', calories: 100, portion: '1 cup' }
      ],
      totalCalories: 260,
      image: '🥜'
    },
    {
      id: 'es2',
      name: 'Light Bites',
      items: [
        { name: 'Whole Grain Crackers', calories: 120, portion: '4-5 pieces' },
        { name: 'Hummus', calories: 70, portion: '2 tbsp' },
        { name: 'Cucumber Slices', calories: 8, portion: '1 cup' }
      ],
      totalCalories: 198,
      image: '🍘'
    },
    {
      id: 'es3',
      name: 'Protein Snack',
      items: [
        { name: 'Greek Yogurt', calories: 100, portion: '1 small cup' },
        { name: 'Honey', calories: 60, portion: '1 tbsp' },
        { name: 'Granola', calories: 120, portion: '2 tbsp' }
      ],
      totalCalories: 280,
      image: '🥄'
    }
  ]
};

// Add back the DIET_PLANS constant
const DIET_PLANS = {
  'veg_loss': [
    {
      meal: 'Breakfast',
      items: [
        '1 cup Tea/Coffee [without sugar]',
        '2-3 tbsp cornflakes OR overnight soaked 1 tsp chia seeds in 2-3 tbsp Oats in 1 cup milk with few drops of honey',
        'Oats omelette [2 tbsp Oats mixed in 2 eggs]'
      ]
    },
    {
      meal: 'Lunch',
      items: [
        '1 small plate Carrot/Cucumber Salad',
        '1 cup Rice (Preferably brown rice) + 1 bowl Dal OR 1 bowl Vegetable Khichdi',
        '1 cup Curd (unsweetened)'
      ]
    },
    {
      meal: 'Evening Snacks',
      items: [
        'Handful Of Makhanas OR Popcorn',
        'Sprouts/Chaat OR Corn Salad',
        '1 cup Green Tea/Green Coffee'
      ]
    },
    {
      meal: 'Dinner',
      items: [
        '1 vati mixed Salad',
        '2 Jowar Roti',
        '1 small bowl Sabzi OR Dal'
      ]
    }
  ],
  'veg_gain': [
    {
      meal: 'Breakfast',
      items: [
        '1 cup Tea/Coffee',
        '1 plate Poha/2 Besan Chilla/2 Utti with Sambhar',
        '2 Peanuts/Cheese Sandwich OR 2 Paneer Sandwich'
      ]
    },
    {
      meal: 'Lunch',
      items: [
        '3 Roti OR 1 cup Rice',
        '1 small bowl Sabzi OR Dal',
        '1 bowl Pasta',
        '1 cup Curd'
      ]
    },
    {
      meal: 'Evening Snacks',
      items: [
        'Mixed Nuts (1 handful)',
        'Fruit Smoothie',
        'Whole Grain Crackers with Cheese'
      ]
    },
    {
      meal: 'Dinner',
      items: [
        '2 paneer Paratha with Curd OR Paneer Bhurji with 4 Bread OR Paneer tikka',
        '2 Roti OR 1 cup Rice',
        '1 small bowl Sabzi OR Dal'
      ]
    }
  ],
  'nonveg_loss': [
    {
      meal: 'Breakfast',
      items: [
        '1 cup Tea/Coffee [without sugar]',
        '2-3 tbsp cornflakes OR overnight soaked 1 tsp chia seeds in 2-3 tbsp Oats in 1 cup milk with few drops of honey',
        'Oats omelette [2 tbsp Oats mixed in 2 eggs]'
      ]
    },
    {
      meal: 'Lunch',
      items: [
        '1 cup Rice (Preferably brown rice) + 1 bowl Chicken Curry/Dal',
        '1 small plate Carrot/Cucumber Salad',
        '1 cup Curd (unsweetened)'
      ]
    },
    {
      meal: 'Evening Snacks',
      items: [
        'Boiled Egg White',
        'Handful of Mixed Seeds',
        'Green Tea'
      ]
    },
    {
      meal: 'Dinner',
      items: [
        '1 vati mixed Salad',
        '2 Jowar Roti',
        '1 small bowl Sabzi OR Dal OR 3-4 medium piece of Chicken OR 1 Fish (In grilled or gravy form)'
      ]
    }
  ],
  'nonveg_gain': [
    {
      meal: 'Breakfast',
      items: [
        '1 cup Tea/Coffee',
        '1 plate Poha/2 Besan Chilla/2 Utti with Sambhar',
        'Peanuts/Cheese Sandwich OR 4 Egg Whites (Omelette/scrambled/boiled)'
      ]
    },
    {
      meal: 'Lunch',
      items: [
        '3 Roti OR 1 cup Rice',
        '1 small bowl Sabzi OR Dal OR 3-4 medium piece of Chicken OR 1 Fish (In grilled or gravy form)',
        '1 bowl Pasta',
        '1 cup Curd'
      ]
    },
    {
      meal: 'Evening Snacks',
      items: [
        'Protein Shake',
        'Mixed Nuts and Dried Fruits',
        'Egg White Omelette'
      ]
    },
    {
      meal: 'Dinner',
      items: [
        '2 paneer Paratha with Curd OR Egg Bhurji with 4 Bread OR Paneer tikka/Chicken Tikka',
        '2 Roti OR 1 cup Rice',
        '1 small bowl Sabzi OR Dal OR 3-4 medium piece of Chicken OR 1 Fish (In grilled or gravy form)'
      ]
    }
  ],
  'vegan_loss': [
    {
      meal: 'Breakfast',
      items: [
        '1 cup Black Tea/Coffee [without sugar]',
        '1 serving Poha/2 Besan Chilla/2 Utti with Sambhar/1 small bowl Oats Upma/Vegan Smoothie Bowl (oats+nuts+fruits and seeds)'
      ]
    },
    {
      meal: 'Lunch',
      items: [
        '1 small plate Carrot/Cucumber Salad',
        '1 cup Rice (Preferably brown rice) + 1 bowl Dal OR 1 bowl Vegetable Khichdi',
        '1 cup Vegan Curd (unsweetened)'
      ]
    },
    {
      meal: 'Evening Snacks',
      items: [
        'Roasted Chickpeas',
        'Fresh Fruit',
        'Green Tea'
      ]
    },
    {
      meal: 'Dinner',
      items: [
        '1 vati mixed Salad',
        '2 Jowar Roti + 1 small bowl Sabzi & Dal OR Mixed Veg Curry with Quinoa'
      ]
    }
  ],
  'vegan_gain': [
    {
      meal: 'Breakfast',
      items: [
        '1 cup vegan Milk',
        '1 plate Poha/2 Besan Chilla/2 Utti with Sambhar',
        '2 Bread with Hazelnut Butter OR Spinach Smoothie made with Plant Milk + Vegan Sandwich with Tofu, Lettuce, Tomato OR Chickpea and Onion Omelette'
      ]
    },
    {
      meal: 'Lunch',
      items: [
        '2 Roti OR 1 cup Rice',
        '1 small bowl Sabzi OR Dal',
        '1 bowl Pasta OR 1 bowl Tofu Noodle Soup OR 1 Bowl Mix Veg Khichdi',
        '1 cup Vegan Yoghurt'
      ]
    },
    {
      meal: 'Evening Snacks',
      items: [
        'Protein-Rich Trail Mix',
        'Soy Milk Smoothie',
        'Whole Grain Toast with Avocado'
      ]
    },
    {
      meal: 'Dinner',
      items: [
        '[Whole Meal - Roti/Rice- Sabzi/Dal]',
        '2 Roti OR 1 cup Rice',
        '1 small bowl Sabzi OR Dal',
        '1 Serving Quinoa Veg Pulao OR 4-5 Vegan Spring Roll'
      ]
    }
  ]
} as const;

// Add DEFAULT_WEEKLY_MEALS object
const DEFAULT_WEEKLY_MEALS = {
  1: [ // Monday
    {
      id: '1',
      name: "Breakfast",
      calories: 420,
      icon: "wb-sunny",
      isPlanned: true,
      items: [
        {
          id: 'mon-breakfast-1',
          name: "Protein Oatmeal Bowl",
          calories: 320,
          portions: "1 bowl (300g)",
          macros: { carbs: 45, protein: 20, fat: 12 }
        },
        {
          id: 'mon-breakfast-2',
          name: "Green Tea",
          calories: 0,
          portions: "1 cup",
          macros: { carbs: 0, protein: 0, fat: 0 }
        },
        {
          id: 'mon-breakfast-3',
          name: "Mixed Berries",
          calories: 100,
          portions: "1 cup",
          macros: { carbs: 25, protein: 1, fat: 0 }
        }
      ],
      macros: { carbs: 70, protein: 21, fat: 12 }
    },
    {
      id: '2',
      name: "Lunch",
      calories: 550,
      icon: "restaurant",
      isPlanned: true,
      items: [
        {
          id: 'mon-lunch-1',
          name: "Grilled Chicken Salad",
          calories: 450,
          portions: "1 bowl (400g)",
          macros: { carbs: 35, protein: 35, fat: 20 }
        },
        {
          id: 'mon-lunch-2',
          name: "Olive Oil Dressing",
          calories: 100,
          portions: "2 tbsp",
          macros: { carbs: 0, protein: 0, fat: 14 }
        }
      ],
      macros: { carbs: 35, protein: 35, fat: 34 }
    },
    {
      id: '3',
      name: "Evening Snacks",
      calories: 0,
      icon: "coffee",
      isPlanned: true,
      items: [],
      macros: { carbs: 0, protein: 0, fat: 0 }
    },
    {
      id: '4',
      name: "Dinner",
      calories: 580,
      icon: "dinner-dining",
      isPlanned: true,
      items: [
        {
          id: 'mon-dinner-1',
          name: "Salmon with Quinoa",
          calories: 480,
          portions: "1 plate (400g)",
          macros: { carbs: 45, protein: 35, fat: 22 }
        },
        {
          id: 'mon-dinner-2',
          name: "Steamed Vegetables",
          calories: 100,
          portions: "1 cup",
          macros: { carbs: 20, protein: 5, fat: 0 }
        }
      ],
      macros: { carbs: 65, protein: 40, fat: 22 }
    }
  ],
  2: [ // Tuesday
    {
      id: '1',
      name: "Breakfast",
      calories: 410,
      icon: "wb-sunny",
      isPlanned: true,
      items: [
        {
          id: 'tue-breakfast-1',
          name: "Avocado Toast",
          calories: 250,
          portions: "2 slices",
          macros: { carbs: 30, protein: 6, fat: 12 }
        },
        {
          id: 'tue-breakfast-2',
          name: "Boiled Egg",
          calories: 70,
          portions: "1 egg",
          macros: { carbs: 1, protein: 6, fat: 5 }
        },
        {
          id: 'tue-breakfast-3',
          name: "Apple",
          calories: 90,
          portions: "1 medium",
          macros: { carbs: 25, protein: 0, fat: 0 }
        }
      ],
      macros: { carbs: 56, protein: 12, fat: 17 }
    },
    {
      id: '2',
      name: "Lunch",
      calories: 530,
      icon: "restaurant",
      isPlanned: true,
      items: [
        {
          id: 'tue-lunch-1',
          name: "Turkey Sandwich",
          calories: 350,
          portions: "1 sandwich",
          macros: { carbs: 40, protein: 20, fat: 8 }
        },
        {
          id: 'tue-lunch-2',
          name: "Carrot Sticks",
          calories: 40,
          portions: "1 cup",
          macros: { carbs: 10, protein: 1, fat: 0 }
        },
        {
          id: 'tue-lunch-3',
          name: "Yogurt",
          calories: 140,
          portions: "1 cup",
          macros: { carbs: 20, protein: 8, fat: 4 }
        }
      ],
      macros: { carbs: 70, protein: 29, fat: 12 }
    },
    {
      id: '3',
      name: "Evening Snacks",
      calories: 120,
      icon: "coffee",
      isPlanned: true,
      items: [
        {
          id: 'tue-snack-1',
          name: "Granola Bar",
          calories: 120,
          portions: "1 bar",
          macros: { carbs: 20, protein: 3, fat: 3 }
        }
      ],
      macros: { carbs: 20, protein: 3, fat: 3 }
    },
    {
      id: '4',
      name: "Dinner",
      calories: 500,
      icon: "dinner-dining",
      isPlanned: true,
      items: [
        {
          id: 'tue-dinner-1',
          name: "Chicken Stir Fry",
          calories: 400,
          portions: "1 bowl",
          macros: { carbs: 5, protein: 35, fat: 25 }
        },
        {
          id: 'tue-dinner-2',
          name: "Brown Rice",
          calories: 100,
          portions: "1/2 cup",
          macros: { carbs: 22, protein: 2, fat: 1 }
        }
      ],
      macros: { carbs: 27, protein: 39, fat: 26 }
    }
  ],
  3: [ // Wednesday
    {
      id: '1',
      name: "Breakfast",
      calories: 390,
      icon: "wb-sunny",
      isPlanned: true,
      items: [
        {
          id: 'wed-breakfast-1',
          name: "Banana Pancakes",
          calories: 300,
          portions: "2 pancakes",
          macros: { carbs: 50, protein: 7, fat: 6 }
        },
        {
          id: 'wed-breakfast-2',
          name: "Milk",
          calories: 90,
          portions: "1 cup",
          macros: { carbs: 12, protein: 6, fat: 3 }
        }
      ],
      macros: { carbs: 62, protein: 13, fat: 9 }
    },
    {
      id: '2',
      name: "Lunch",
      calories: 540,
      icon: "restaurant",
      isPlanned: true,
      items: [
        {
          id: 'wed-lunch-1',
          name: "Veggie Burger",
          calories: 400,
          portions: "1 burger",
          macros: { carbs: 45, protein: 18, fat: 12 }
        },
        {
          id: 'wed-lunch-2',
          name: "Sweet Potato Fries",
          calories: 140,
          portions: "1 cup",
          macros: { carbs: 30, protein: 2, fat: 5 }
        }
      ],
      macros: { carbs: 75, protein: 20, fat: 17 }
    },
    {
      id: '3',
      name: "Evening Snacks",
      calories: 100,
      icon: "coffee",
      isPlanned: true,
      items: [
        {
          id: 'wed-snack-1',
          name: "Fruit Salad",
          calories: 100,
          portions: "1 bowl",
          macros: { carbs: 25, protein: 1, fat: 0 }
        }
      ],
      macros: { carbs: 25, protein: 1, fat: 0 }
    },
    {
      id: '4',
      name: "Dinner",
      calories: 520,
      icon: "dinner-dining",
      isPlanned: true,
      items: [
        {
          id: 'wed-dinner-1',
          name: "Grilled Fish",
          calories: 400,
          portions: "1 fillet",
          macros: { carbs: 0, protein: 35, fat: 20 }
        },
        {
          id: 'wed-dinner-2',
          name: "Steamed Broccoli",
          calories: 60,
          portions: "1 cup",
          macros: { carbs: 12, protein: 3, fat: 0 }
        },
        {
          id: 'wed-dinner-3',
          name: "Mashed Potatoes",
          calories: 60,
          portions: "1/2 cup",
          macros: { carbs: 14, protein: 2, fat: 1 }
        }
      ],
      macros: { carbs: 26, protein: 40, fat: 21 }
    }
  ],
  4: [ // Thursday
    {
      id: '1',
      name: "Breakfast",
      calories: 400,
      icon: "wb-sunny",
      isPlanned: true,
      items: [
        {
          id: 'thu-breakfast-1',
          name: "Oats Porridge",
          calories: 250,
          portions: "1 bowl",
          macros: { carbs: 40, protein: 8, fat: 5 }
        },
        {
          id: 'thu-breakfast-2',
          name: "Banana",
          calories: 90,
          portions: "1 medium",
          macros: { carbs: 23, protein: 1, fat: 0 }
        },
        {
          id: 'thu-breakfast-3',
          name: "Almonds",
          calories: 60,
          portions: "10 pieces",
          macros: { carbs: 2, protein: 2, fat: 5 }
        }
      ],
      macros: { carbs: 65, protein: 11, fat: 10 }
    },
    {
      id: '2',
      name: "Lunch",
      calories: 530,
      icon: "restaurant",
      isPlanned: true,
      items: [
        {
          id: 'thu-lunch-1',
          name: "Paneer Curry",
          calories: 350,
          portions: "1 bowl",
          macros: { carbs: 15, protein: 18, fat: 20 }
        },
        {
          id: 'thu-lunch-2',
          name: "Rice",
          calories: 180,
          portions: "1 cup",
          macros: { carbs: 40, protein: 4, fat: 1 }
        }
      ],
      macros: { carbs: 55, protein: 22, fat: 21 }
    },
    {
      id: '3',
      name: "Evening Snacks",
      calories: 110,
      icon: "coffee",
      isPlanned: true,
      items: [
        {
          id: 'thu-snack-1',
          name: "Roasted Chickpeas",
          calories: 110,
          portions: "1/2 cup",
          macros: { carbs: 18, protein: 6, fat: 2 }
        }
      ],
      macros: { carbs: 18, protein: 6, fat: 2 }
    },
    {
      id: '4',
      name: "Dinner",
      calories: 510,
      icon: "dinner-dining",
      isPlanned: true,
      items: [
        {
          id: 'thu-dinner-1',
          name: "Chicken Curry",
          calories: 400,
          portions: "1 bowl",
          macros: { carbs: 5, protein: 35, fat: 25 }
        },
        {
          id: 'thu-dinner-2',
          name: "Chapati",
          calories: 110,
          portions: "2 pieces",
          macros: { carbs: 22, protein: 4, fat: 1 }
        }
      ],
      macros: { carbs: 27, protein: 39, fat: 26 }
    }
  ],
  5: [ // Friday
    {
      id: '1',
      name: "Breakfast",
      calories: 430,
      icon: "wb-sunny",
      isPlanned: true,
      items: [
        {
          id: 'fri-breakfast-1',
          name: "Egg Sandwich",
          calories: 250,
          portions: "1 sandwich",
          macros: { carbs: 30, protein: 12, fat: 8 }
        },
        {
          id: 'fri-breakfast-2',
          name: "Orange Juice",
          calories: 90,
          portions: "1 glass",
          macros: { carbs: 22, protein: 2, fat: 0 }
        },
        {
          id: 'fri-breakfast-3',
          name: "Walnuts",
          calories: 90,
          portions: "5 pieces",
          macros: { carbs: 2, protein: 2, fat: 8 }
        }
      ],
      macros: { carbs: 54, protein: 16, fat: 16 }
    },
    {
      id: '2',
      name: "Lunch",
      calories: 560,
      icon: "restaurant",
      isPlanned: true,
      items: [
        {
          id: 'fri-lunch-1',
          name: "Fish Curry",
          calories: 400,
          portions: "1 bowl",
          macros: { carbs: 5, protein: 35, fat: 25 }
        },
        {
          id: 'fri-lunch-2',
          name: "Rice",
          calories: 160,
          portions: "1 cup",
          macros: { carbs: 36, protein: 3, fat: 1 }
        }
      ],
      macros: { carbs: 41, protein: 38, fat: 26 }
    },
    {
      id: '3',
      name: "Evening Snacks",
      calories: 130,
      icon: "coffee",
      isPlanned: true,
      items: [
        {
          id: 'fri-snack-1',
          name: "Peanut Butter Toast",
          calories: 130,
          portions: "1 slice",
          macros: { carbs: 15, protein: 5, fat: 7 }
        }
      ],
      macros: { carbs: 15, protein: 5, fat: 7 }
    },
    {
      id: '4',
      name: "Dinner",
      calories: 520,
      icon: "dinner-dining",
      isPlanned: true,
      items: [
        {
          id: 'fri-dinner-1',
          name: "Paneer Tikka",
          calories: 350,
          portions: "1 plate",
          macros: { carbs: 10, protein: 20, fat: 22 }
        },
        {
          id: 'fri-dinner-2',
          name: "Mixed Veg",
          calories: 120,
          portions: "1 cup",
          macros: { carbs: 20, protein: 4, fat: 2 }
        },
        {
          id: 'fri-dinner-3',
          name: "Chapati",
          calories: 50,
          portions: "1 piece",
          macros: { carbs: 11, protein: 2, fat: 0 }
        }
      ],
      macros: { carbs: 41, protein: 26, fat: 24 }
    }
  ],
  6: [ // Saturday
    {
      id: '1',
      name: "Breakfast",
      calories: 410,
      icon: "wb-sunny",
      isPlanned: true,
      items: [
        {
          id: 'sat-breakfast-1',
          name: "Veg Upma",
          calories: 250,
          portions: "1 bowl",
          macros: { carbs: 45, protein: 6, fat: 5 }
        },
        {
          id: 'sat-breakfast-2',
          name: "Papaya",
          calories: 60,
          portions: "1 cup",
          macros: { carbs: 15, protein: 1, fat: 0 }
        },
        {
          id: 'sat-breakfast-3',
          name: "Almonds",
          calories: 100,
          portions: "10 pieces",
          macros: { carbs: 2, protein: 4, fat: 9 }
        }
      ],
      macros: { carbs: 62, protein: 11, fat: 14 }
    },
    {
      id: '2',
      name: "Lunch",
      calories: 540,
      icon: "restaurant",
      isPlanned: true,
      items: [
        {
          id: 'sat-lunch-1',
          name: "Dal Tadka",
          calories: 300,
          portions: "1 bowl",
          macros: { carbs: 30, protein: 12, fat: 8 }
        },
        {
          id: 'sat-lunch-2',
          name: "Rice",
          calories: 180,
          portions: "1 cup",
          macros: { carbs: 40, protein: 4, fat: 1 }
        },
        {
          id: 'sat-lunch-3',
          name: "Cucumber Salad",
          calories: 60,
          portions: "1 bowl",
          macros: { carbs: 10, protein: 2, fat: 0 }
        }
      ],
      macros: { carbs: 80, protein: 18, fat: 9 }
    },
    {
      id: '3',
      name: "Evening Snacks",
      calories: 120,
      icon: "coffee",
      isPlanned: true,
      items: [
        {
          id: 'sat-snack-1',
          name: "Sprouts Salad",
          calories: 120,
          portions: "1 bowl",
          macros: { carbs: 20, protein: 6, fat: 1 }
        }
      ],
      macros: { carbs: 20, protein: 6, fat: 1 }
    },
    {
      id: '4',
      name: "Dinner",
      calories: 500,
      icon: "dinner-dining",
      isPlanned: true,
      items: [
        {
          id: 'sat-dinner-1',
          name: "Mixed Veg Curry",
          calories: 350,
          portions: "1 bowl",
          macros: { carbs: 25, protein: 8, fat: 18 }
        },
        {
          id: 'sat-dinner-2',
          name: "Jeera Rice",
          calories: 150,
          portions: "1 cup",
          macros: { carbs: 35, protein: 3, fat: 2 }
        }
      ],
      macros: { carbs: 60, protein: 11, fat: 20 }
    }
  ],
  7: [ // Sunday
    {
      id: '1',
      name: "Breakfast",
      calories: 430,
      icon: "wb-sunny",
      isPlanned: true,
      items: [
        {
          id: 'sun-breakfast-1',
          name: "Sunday Special Pancakes",
          calories: 300,
          portions: "2 pancakes",
          macros: { carbs: 50, protein: 8, fat: 7 }
        },
        {
          id: 'sun-breakfast-2',
          name: "Orange Juice",
          calories: 100,
          portions: "1 glass",
          macros: { carbs: 25, protein: 2, fat: 0 }
        },
        {
          id: 'sun-breakfast-3',
          name: "Boiled Egg",
          calories: 30,
          portions: "1 egg",
          macros: { carbs: 1, protein: 3, fat: 2 }
        }
      ],
      macros: { carbs: 76, protein: 13, fat: 9 }
    },
    {
      id: '2',
      name: "Lunch",
      calories: 560,
      icon: "restaurant",
      isPlanned: true,
      items: [
        {
          id: 'sun-lunch-1',
          name: "Chicken Biryani",
          calories: 400,
          portions: "1 plate",
          macros: { carbs: 55, protein: 20, fat: 12 }
        },
        {
          id: 'sun-lunch-2',
          name: "Raita",
          calories: 60,
          portions: "1 bowl",
          macros: { carbs: 6, protein: 3, fat: 2 }
        },
        {
          id: 'sun-lunch-3',
          name: "Salad",
          calories: 100,
          portions: "1 bowl",
          macros: { carbs: 10, protein: 2, fat: 1 }
        }
      ],
      macros: { carbs: 71, protein: 25, fat: 15 }
    },
    {
      id: '3',
      name: "Evening Snacks",
      calories: 140,
      icon: "coffee",
      isPlanned: true,
      items: [
        {
          id: 'sun-snack-1',
          name: "Fruit Yogurt",
          calories: 140,
          portions: "1 cup",
          macros: { carbs: 28, protein: 4, fat: 2 }
        }
      ],
      macros: { carbs: 28, protein: 4, fat: 2 }
    },
    {
      id: '4',
      name: "Dinner",
      calories: 520,
      icon: "dinner-dining",
      isPlanned: true,
      items: [
        {
          id: 'sun-dinner-1',
          name: "Paneer Butter Masala",
          calories: 350,
          portions: "1 bowl",
          macros: { carbs: 15, protein: 12, fat: 22 }
        },
        {
          id: 'sun-dinner-2',
          name: "Naan",
          calories: 120,
          portions: "1 piece",
          macros: { carbs: 25, protein: 4, fat: 2 }
        },
        {
          id: 'sun-dinner-3',
          name: "Mixed Veg",
          calories: 50,
          portions: "1/2 cup",
          macros: { carbs: 10, protein: 2, fat: 0 }
        }
      ],
      macros: { carbs: 50, protein: 18, fat: 24 }
    }
  ]
};

// Add getDailyQuote function
const DIET_QUOTES = [
  "Let food be thy medicine, and medicine be thy food. - Hippocrates",
  "You are what you eat, so don't be fast, cheap, easy, or fake.",
  "A healthy outside starts from the inside. - Robert Urich",
  // ... (add more quotes as in your previous code)
];
const getDailyQuote = () => {
  const today = new Date();
  const dayOfMonth = today.getDate() - 1; // 0-based index
  return DIET_QUOTES[dayOfMonth % DIET_QUOTES.length];
};

// Add MacroBar component
const MacroBar: React.FC<{
  label: string;
  amount: number;
}> = ({ label, amount }) => {
  return (
    <View style={styles.macroItem}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroAmount}>{amount}g consumed</Text>
    </View>
  );
};

// Add MealItem component
const MealItem: React.FC<{
  meal: MealData;
  onPress: () => void;
  isExpanded: boolean;
  onAddMeal?: () => void;
  onRemoveItem?: (mealId: string, itemId: string) => void;
}> = ({ meal, onPress, isExpanded, onAddMeal, onRemoveItem }) => {
  const getMealEmoji = (mealName: string) => {
    switch (mealName.toLowerCase()) {
      case 'breakfast':
        return '🍳';
      case 'lunch':
        return '🍱';
      case 'evening snacks':
        return '🥨';
      case 'dinner':
        return '🍽️';
      default:
        return '🍴';
    }
  };

  return (
    <View style={styles.mealItemContainer}>
      <TouchableOpacity
        style={[
          styles.mealItem,
          isExpanded && styles.mealItemExpanded
        ]}
        onPress={onPress}
      >
        <View style={styles.mealItemLeft}>
          <View style={styles.mealIcon}>
            <Text style={styles.mealEmoji}>{getMealEmoji(meal.name)}</Text>
          </View>
          <View style={styles.mealInfo}>
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.calorieText}>
              {meal.calories}kcal
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.mealActionButton}
          onPress={() => {
            if (onAddMeal) {
              onAddMeal();
            }
          }}
        >
          <Text style={styles.plusButtonText}>+</Text>
        </TouchableOpacity>
      </TouchableOpacity>
      {isExpanded && meal.items && meal.items.length > 0 && (
        <View style={styles.expandedContent}>
          {meal.items.map((item, index) => (
            <View key={index} style={styles.mealItemDetail}>
              <View style={styles.mealItemDetailLeft}>
                <Text style={styles.mealItemDetailName}>{item.name}</Text>
                <Text style={styles.mealItemDetailPortions}>{item.portions}</Text>
                <View style={styles.macroTags}>
                  <View style={[styles.macroTag, { backgroundColor: colors.carbs + '20' }]}>
                    <Text style={[styles.macroTagText, { color: colors.carbs }]}> 
                      {item.macros.carbs}g carbs
                    </Text>
                  </View>
                  <View style={[styles.macroTag, { backgroundColor: colors.protein + '20' }]}> 
                    <Text style={[styles.macroTagText, { color: colors.protein }]}> 
                      {item.macros.protein}g protein
                    </Text>
                  </View>
                  <View style={[styles.macroTag, { backgroundColor: colors.fat + '20' }]}> 
                    <Text style={[styles.macroTagText, { color: colors.fat }]}> 
                      {item.macros.fat}g fat
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.mealItemDetailRight}>
                <Text style={styles.mealItemDetailCalories}>{item.calories} kcal</Text>
                <TouchableOpacity
                  style={[styles.removeButton, { backgroundColor: colors.carbs + '20' }]}
                  onPress={() => onRemoveItem?.(meal.id, item.id)}
                >
                  <Text style={[styles.removeButtonText]}>-</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addMoreButton}
            onPress={() => onAddMeal?.()}
          >
            <Icon name="add" size={20} color={colors.primary} />
            <Text style={styles.addMoreText}>Add another item</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const FoodListModal: React.FC<{
  visible: boolean;
  mealType: string;
  onClose: () => void;
  onSelect: (food: any) => void;
}> = ({ visible, mealType, onClose, onSelect }) => {
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});
  const [activeDietType, setActiveDietType] = useState<'veg' | 'nonveg' | 'vegan'>('veg');
  const [activeDietGoal, setActiveDietGoal] = useState<'loss' | 'gain' | null>(null);
  
  // Get diet-specific meals
  const getDietMeals = () => {
    if (!activeDietGoal) return []; // Return empty array if no goal is selected
    
    const planKey = `${activeDietType}_${activeDietGoal}`;
    const plan = DIET_PLANS[planKey as keyof typeof DIET_PLANS] || [];
    const currentMeal = plan.find((m: any) => m.meal.toLowerCase() === mealType.toLowerCase());
    return currentMeal?.items || [];
  };

  // Filter food items based on diet type
  const getFilteredFoods = () => {
    const foods = FOOD_LIST[mealType.toLowerCase() as keyof typeof FOOD_LIST] || [];
    
    return foods.filter(food => {
      // Check if any item in the food contains non-vegetarian ingredients
      const hasNonVeg = food.items.some(item => {
        const itemName = item.name.toLowerCase();
        return itemName.includes('chicken') || 
               itemName.includes('meat') || 
               itemName.includes('beef') || 
               itemName.includes('pork') || 
               itemName.includes('fish') || 
               itemName.includes('salmon') || 
               itemName.includes('tuna') || 
               itemName.includes('egg');
      });

      // Filter based on diet type
      switch (activeDietType) {
        case 'veg':
          return !hasNonVeg;
        case 'nonveg':
          return hasNonVeg;
        case 'vegan':
          // For vegan, exclude both non-veg and dairy products
          const hasDairy = food.items.some(item => {
            const itemName = item.name.toLowerCase();
            return itemName.includes('milk') || 
                   itemName.includes('yogurt') || 
                   itemName.includes('cheese') || 
                   itemName.includes('butter') || 
                   itemName.includes('cream');
          });
          return !hasNonVeg && !hasDairy;
        default:
          return true;
      }
    });
  };

  const foods = getFilteredFoods();
  const dietMeals = getDietMeals();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>Add {mealType}</Text>
              <Text style={styles.modalSubtitle}>Select food items to add to your meal</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Diet Type and Goal Selection */}
          <View style={styles.dietSelector}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.dietButtonsContainer}
            >
              {/* Diet Type Buttons */}
              {['veg', 'nonveg', 'vegan'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.dietButton,
                    activeDietType === type && styles.activeDietButton,
                    { marginRight: 8 }
                  ]}
                  onPress={() => setActiveDietType(type as any)}
                >
                  <Text style={[
                    styles.dietButtonText,
                    activeDietType === type && styles.activeDietButtonText
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Goal Buttons */}
              {['loss', 'gain'].map(goal => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.dietButton,
                    activeDietGoal === goal && styles.activeDietButton,
                    { marginRight: 8 }
                  ]}
                  onPress={() => {
                    // Toggle the goal selection
                    setActiveDietGoal(activeDietGoal === goal ? null : goal as any);
                  }}
                >
                  <Text style={[
                    styles.dietButtonText,
                    activeDietGoal === goal && styles.activeDietButtonText
                  ]}>
                    Weight {goal.charAt(0).toUpperCase() + goal.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView style={styles.foodList}>
            {/* Diet Plan Suggestions - Only show if a goal is selected */}
            {activeDietGoal && dietMeals.length > 0 && (
              <View style={styles.foodItemCard}>
                <View style={styles.foodItemHeader}>
                  <Text style={[styles.foodEmoji, { marginRight: 8 }]}>🎯</Text>
                  <View style={styles.foodItemInfo}>
                    <Text style={styles.foodName}>Suggested {mealType}</Text>
                    <Text style={styles.foodCalories}>From your selected diet plan</Text>
                  </View>
                </View>
                <View style={styles.foodItemIngredients}>
                  {dietMeals.map((item, index) => {
                    const itemKey = `diet-${index}`;
                    const itemCount = selectedItems[itemKey] || 0;

                    return (
                      <View key={index} style={[
                        styles.ingredientRow,
                        itemCount > 0 && styles.selectedIngredient
                      ]}>
                        <View style={styles.ingredientLeft}>
                          <View style={styles.ingredientNameContainer}>
                            <Text style={styles.ingredientName}>{item}</Text>
                          </View>
                        </View>
                        <View style={styles.quantityControls}>
                          <TouchableOpacity
                            style={[
                              styles.quantityButton,
                              itemCount === 0 && styles.quantityButtonDisabled
                            ]}
                            onPress={() => {
                              if (itemCount > 0) {
                                setSelectedItems(prev => ({
                                  ...prev,
                                  [itemKey]: itemCount - 1
                                }));
                              }
                            }}
                            disabled={itemCount === 0}
                          >
                            <Text style={styles.quantityButtonText}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{itemCount}</Text>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => {
                              setSelectedItems(prev => ({
                                ...prev,
                                [itemKey]: (prev[itemKey] || 0) + 1
                              }));
                              onSelect({
                                name: item,
                                calories: 100, // Placeholder calories
                                portion: '1 serving'
                              });
                            }}
                          >
                            <Text style={styles.quantityButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Regular food items */}
            {foods.map((food) => (
              <View key={food.id} style={styles.foodItemCard}>
                <View style={styles.foodItemHeader}>
                  <Text style={styles.foodEmoji}>{food.image}</Text>
                  <View style={styles.foodItemInfo}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodCalories}>{food.totalCalories} kcal</Text>
                  </View>
                </View>

                <View style={styles.foodItemIngredients}>
                  {food.items.map((item, index) => {
                    const itemKey = `${food.id}-${index}`;
                    const itemCount = selectedItems[itemKey] || 0;

                    return (
                      <View
                        key={index}
                        style={[
                          styles.ingredientRow,
                          itemCount > 0 && styles.selectedIngredient
                        ]}
                      >
                        <View style={styles.ingredientLeft}>
                          <View style={styles.ingredientNameContainer}>
                            <Text style={styles.ingredientName}>{item.name}</Text>
                          </View>
                          <Text style={styles.ingredientInfo}>
                            {item.portion} ({item.calories} kcal)
                          </Text>
                        </View>
                        <View style={styles.quantityControls}>
                          <TouchableOpacity
                            style={[
                              styles.quantityButton,
                              itemCount === 0 && styles.quantityButtonDisabled
                            ]}
                            onPress={() => {
                              const currentCount = selectedItems[itemKey] || 0;
                              if (currentCount > 0) {
                                setSelectedItems(prev => ({
                                  ...prev,
                                  [itemKey]: currentCount - 1
                                }));
                              }
                            }}
                            disabled={itemCount === 0}
                          >
                            <Text style={[
                              styles.quantityButtonText,
                              itemCount === 0 && styles.quantityButtonTextDisabled
                            ]}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{itemCount}</Text>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => {
                              const newCount = (selectedItems[itemKey] || 0) + 1;
                              setSelectedItems(prev => ({
                                ...prev,
                                [itemKey]: newCount
                              }));
                              onSelect({
                                id: `${food.id}-item-${index}`,
                                name: item.name,
                                calories: item.calories,
                                portion: item.portion,
                                image: food.image
                              });
                            }}
                          >
                            <Text style={styles.quantityButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={onClose}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Helper to create arc path for a given percentage and angles
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", r, r, 0, arcSweep, 0, end.x, end.y
  ].join(" ");
}

const App: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [currentScreen, setCurrentScreen] = useState('main');
  const today = new Date();
  const [dietType, setDietType] = useState<'veg' | 'nonveg' | 'vegan'>('veg');
  const [dietGoal, setDietGoal] = useState<'loss' | 'gain'>('loss');
  const [showDietPlanModal, setShowDietPlanModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today.getDate().toString());
  const [showCalendar, setShowCalendar] = useState(false);
  const [mealsData, setMealsData] = useState<{ [key: string]: MealData[] }>({
    [today.getDate().toString()]: [
      {
        id: '1',
        name: "Breakfast",
        calories: 0,
        icon: "wb-sunny",
        isPlanned: true,
        items: [],
        macros: { carbs: 0, protein: 0, fat: 0 }
      },
      {
        id: '2',
        name: "Lunch",
        calories: 0,
        icon: "restaurant",
        isPlanned: true,
        items: [],
        macros: { carbs: 0, protein: 0, fat: 0 }
      },
      {
        id: '3',
        name: "Evening Snacks",
        calories: 0,
        icon: "coffee",
        isPlanned: true,
        items: [],
        macros: { carbs: 0, protein: 0, fat: 0 }
      },
      {
        id: '4',
        name: "Dinner",
        calories: 0,
        icon: "dinner-dining",
        isPlanned: true,
        items: [],
        macros: { carbs: 0, protein: 0, fat: 0 }
      }
    ]
  });
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);
  const [showMealOptions, setShowMealOptions] = useState<string | null>(null);
  const [dailyQuote, setDailyQuote] = useState("");
  // Add state for selectedMealIndex
  const [selectedMealIndex, setSelectedMealIndex] = useState(0);
  // Add state for goal selection
  const [selectedGoal, setSelectedGoal] = useState('Maintenance Calories');
  const [showGoalDropdown, setShowGoalDropdown] = useState(false);
  const goalOptions = ['Maintenance Calories', 'Calorie Surplus', 'Calorie Deficit'];
  // Add state for meal view modal
  const [viewMealModal, setViewMealModal] = useState<{ visible: boolean, meal: MealData | null }>({ visible: false, meal: null });

  // Get meals for the selected date
  const meals = mealsData[selectedDate] || [];
  const selectedMeal = meals[selectedMealIndex] || meals[0];

  const initializeMealsForDate = (date: string) => {
    if (!mealsData[date]) {
      // Only use DEFAULT_WEEKLY_MEALS for current date
      const isCurrentDate = date === new Date().getDate().toString();
      const dayNumber = new Date().getDay() || 7;
      
      const defaultMeals = isCurrentDate 
        ? DEFAULT_WEEKLY_MEALS[dayNumber as keyof typeof DEFAULT_WEEKLY_MEALS] 
        : [
          {
            id: '1',
            name: "Breakfast",
            calories: 0,
            icon: "wb-sunny",
            isPlanned: true,
            items: [],
            macros: { carbs: 0, protein: 0, fat: 0 }
          },
          {
            id: '2',
            name: "Lunch",
            calories: 0,
            icon: "restaurant",
            isPlanned: true,
            items: [],
            macros: { carbs: 0, protein: 0, fat: 0 }
          },
          {
            id: '3',
            name: "Evening Snacks",
            calories: 0,
            icon: "coffee",
            isPlanned: true,
            items: [],
            macros: { carbs: 0, protein: 0, fat: 0 }
          },
          {
            id: '4',
            name: "Dinner",
            calories: 0,
            icon: "dinner-dining",
            isPlanned: true,
            items: [],
            macros: { carbs: 0, protein: 0, fat: 0 }
          }
        ];

      setMealsData(prev => ({
        ...prev,
        [date]: defaultMeals
      }));
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    initializeMealsForDate(date);
    setShowCalendar(false);
    setExpandedMealId(null);
  };

  const toggleMealExpand = (id: string) => {
    setExpandedMealId(expandedMealId === id ? null : id);
    const meal = meals.find((m: any) => m.id === id);
    if (meal && (!meal.items || meal.items.length === 0)) {
      setShowMealOptions(id);
    }
  };

  const calculateTotalCalories = () => {
    return meals.reduce((total, meal) => total + (meal.calories || 0), 0);
  };

  const calculateMacros = () => {
    return meals.reduce((totals, meal) => ({
      carbs: totals.carbs + (meal.macros?.carbs || 0),
      protein: totals.protein + (meal.macros?.protein || 0),
      fat: totals.fat + (meal.macros?.fat || 0)
    }), { carbs: 0, protein: 0, fat: 0 });
  };

  const handleAddMeal = (mealId: string) => {
    console.log('Opening meal options for:', mealId);
    setShowMealOptions(mealId);
  };

  const handleSelectFood = (mealId: string, selectedItem: any) => {
    console.log('Selected food item:', selectedItem);

    setMealsData(prevMealsData => {
      const updatedMeals = (prevMealsData[selectedDate] || []).map(meal => {
        if (meal.id === mealId) {
          const newItem = {
            id: `${mealId}-${Date.now()}-${selectedItem.name}`,
            name: selectedItem.name,
            calories: selectedItem.calories,
            portions: selectedItem.portion,
            macros: {
              carbs: Math.round(selectedItem.calories * 0.5 / 4), // 50% of calories from carbs
              protein: Math.round(selectedItem.calories * 0.3 / 4), // 30% of calories from protein
              fat: Math.round(selectedItem.calories * 0.2 / 9) // 20% of calories from fat
            }
          };

          const currentCalories = meal.calories || 0;
          const currentMacros = meal.macros || { carbs: 0, protein: 0, fat: 0 };

          return {
            ...meal,
            calories: currentCalories + selectedItem.calories,
            items: [...(meal.items || []), newItem],
            macros: {
              carbs: currentMacros.carbs + newItem.macros.carbs,
              protein: currentMacros.protein + newItem.macros.protein,
              fat: currentMacros.fat + newItem.macros.fat
            }
          };
        }
        return meal;
      });

      return {
        ...prevMealsData,
        [selectedDate]: updatedMeals
      };
    });
  };

  const handleRemoveItem = (mealId: string, itemId: string) => {
    setMealsData(prevMealsData => {
      const updatedMeals = (prevMealsData[selectedDate] || []).map(meal => {
        if (meal.id === mealId) {
          const itemToRemove = meal.items.find(item => item.id === itemId);
          if (!itemToRemove) return meal;

          const updatedItems = meal.items.filter(item => item.id !== itemId);
          const currentMacros = meal.macros || { carbs: 0, protein: 0, fat: 0 };

          return {
            ...meal,
            items: updatedItems,
            calories: meal.calories - itemToRemove.calories,
            macros: {
              carbs: currentMacros.carbs - itemToRemove.macros.carbs,
              protein: currentMacros.protein - itemToRemove.macros.protein,
              fat: currentMacros.fat - itemToRemove.macros.fat
            }
          };
        }
        return meal;
      });

      return {
        ...prevMealsData,
        [selectedDate]: updatedMeals
      };
    });
  };

  useEffect(() => {
    const loadMealsData = async () => {
      const savedMealsJSON = await AsyncStorage.getItem('mealsData');
      const savedMeals = savedMealsJSON ? JSON.parse(savedMealsJSON) : {};
      
      const todayDateStr = new Date().getDate().toString();

      // If there's no data for today in what we loaded, initialize it.
      if (!savedMeals[todayDateStr]) {
        const dayNumber = new Date().getDay() || 7; // Sunday is 0, so make it 7 for our data structure
        const defaultMeals = DEFAULT_WEEKLY_MEALS[dayNumber as keyof typeof DEFAULT_WEEKLY_MEALS] || [];
        savedMeals[todayDateStr] = defaultMeals;
      }
      
      setMealsData(savedMeals);
    };

    loadMealsData();
    setDailyQuote(getDailyQuote());
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('mealsData', JSON.stringify(mealsData));
  }, [mealsData]);

  const totalCalories = calculateTotalCalories();
  const macros = calculateMacros();
  const currentDate = new Date().getDate().toString();
  const hasConsumption = mealsData[selectedDate]?.some(meal => meal.calories > 0) || false;
  const showStats = selectedDate === currentDate || hasConsumption;
  const caloriesConsumed = showStats ? totalCalories : 0;

  // Format the selected date as 'DD MMMM'
  const selectedDateObj = new Date();
  selectedDateObj.setDate(Number(selectedDate));
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const formattedDate = `${selectedDateObj.getDate()} ${monthNames[selectedDateObj.getMonth()]}`;

  // Determine max calories based on selectedGoal
  let maxCalories = 2000;
  if (selectedGoal === 'Calorie Surplus') maxCalories = 3000;
  if (selectedGoal === 'Calorie Deficit') maxCalories = 1500;
  const percent = maxCalories > 0 ? Math.min(caloriesConsumed / maxCalories, 1) : 0;

  const renderWeekView = () => (
        <View style={styles.weekViewContainer}>
      <TouchableOpacity
        style={styles.weekHeaderButton}
        onPress={() => setShowCalendar(true)}
      >
        <Text style={styles.weekViewText}>Week View</Text>
        <Text style={[styles.weekViewText, { marginLeft: 4 }]}></Text>
      </TouchableOpacity>
          <View style={styles.daysContainer}>
            {CURRENT_WEEK.map((dayObj, index) => {
              const isSelected = dayObj.date.toString() === selectedDate;
              const isToday = dayObj.isToday;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                isSelected && !isToday && styles.selectedDay,
                isSelected && isToday && styles.todaySelectedDay
                  ]}
                  onPress={() => handleDateSelect(dayObj.date.toString())}
                >
                  <Text style={[
                    styles.dayText,
                isSelected && !isToday && styles.selectedDayText,
                isSelected && isToday && styles.todaySelectedDayText,
                !isSelected && isToday && styles.todayText
                  ]}>{dayObj.label}</Text>
                  <Text style={[
                    styles.dateText,
                isSelected && !isToday && styles.selectedDayText,
                isSelected && isToday && styles.todaySelectedDayText,
                !isSelected && isToday && styles.todayText
                  ]}>{dayObj.date}</Text>
              {isToday && <View style={[
                styles.dateDot,
                isSelected && styles.selectedDayDot
              ]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
  );

  const renderCalendarModal = () => (
    <Modal
      visible={showCalendar}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCalendar(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Select Date</Text>
            <View style={styles.calendarHeaderRight}>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Text style={[styles.calendarTitle]}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>
      <Calendar
            onDayPress={(day: DateData) => {
              handleDateSelect(day.day.toString());
            }}
            theme={{
              backgroundColor: '#000000',
              calendarBackground: '#000000',
              textSectionTitleColor: '#FFFFFF',
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: '#000000',
              todayTextColor: colors.primary,
              dayTextColor: '#FFFFFF',
              textDisabledColor: '#666666',
              dotColor: colors.primary,
              monthTextColor: '#FFFFFF',
              arrowColor: colors.primary,
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14
            }}
          />
        </View>
      </View>
    </Modal>
  );

  const renderContent = () => {
    return (
      <View>
        {/* New dashboard top section matching the screenshot */}
        <View style={{ paddingHorizontal: 20, paddingTop: 32, paddingBottom: 0 }}>
          {/* Top Row: Avatar, Greeting, Icons */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden', marginRight: 12, backgroundColor: '#F7F7F7', justifyContent: 'center', alignItems: 'center' }}>
              {/* Replace with real avatar if available */}
              <Icon name="account-circle" size={32} color="#888" />
            </View>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#222', flex: 1 }}>Hello, Hailey!</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F7F7F7', justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                <Icon name="search" size={24} color="#555" />
              </View>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F7F7F7', justifyContent: 'center', alignItems: 'center' }}>
                <Icon name="notifications-none" size={24} color="#555" />
              </View>
            </View>
          </View>
          {/* Progress Card */}
          <View style={{ backgroundColor: '#CDECF6', borderRadius: 22, padding: 22, marginBottom: 18, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#222', fontWeight: '600', fontSize: 15, marginBottom: 8 }}>Your Progress</Text>
              <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 36, marginBottom: 2 }}>{Math.round(percent * 100)}%</Text>
              {/* Goal Dropdown */}
              <View style={{ position: 'relative', marginTop: 2 }}>
                <TouchableOpacity
                  style={{
      flexDirection: 'row',
      alignItems: 'center',
                    backgroundColor: '#fff',
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderWidth: 1,
                    borderColor: '#B3E0F7',
                    alignSelf: 'flex-start',
                  }}
                  onPress={() => setShowGoalDropdown(true)}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: '#222', fontWeight: '500', fontSize: 15 }}>Goal</Text>
                  <Text style={{ color: '#222', fontSize: 15, marginLeft: 6 }}>▼</Text>
                </TouchableOpacity>
                <Modal
                  visible={showGoalDropdown}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowGoalDropdown(false)}
                >
                  <Pressable style={{ flex: 1 }} onPress={() => setShowGoalDropdown(false)}>
                    <View style={{ position: 'absolute', top: 160, left: 0, right: 0, alignItems: 'center', backgroundColor: 'transparent' }}>
                      {/* Pointer/arrow */}
                      <View style={{ width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderBottomWidth: 12, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#fff', marginBottom: -2, zIndex: 10000 }} />
                      <View style={{
                        backgroundColor: '#fff',
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: '#B3E0F7',
      shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.10,
                        shadowRadius: 10,
                        elevation: 12,
                        zIndex: 9999,
                        minWidth: 160,
                        maxWidth: 220,
                        paddingVertical: 10,
                        alignItems: 'center',
                      }}>
                        {goalOptions.map(option => {
                          const isSelected = selectedGoal === option;
                          return (
                            <TouchableOpacity
                              key={option}
                              style={{
                                width: 140,
                                marginVertical: 4,
                                backgroundColor: isSelected ? '#F7F7F7' : '#fff',
                                borderRadius: 20,
                                borderWidth: isSelected ? 2 : 1,
                                borderColor: isSelected ? '#FFA500' : '#E0E0E0',
                                paddingVertical: 10,
                                paddingHorizontal: 18,
                                alignItems: 'center',
                              }}
                              onPress={() => {
                                setSelectedGoal(option);
                                setShowGoalDropdown(false);
                              }}
                            >
                              <Text style={{ color: '#222', fontWeight: isSelected ? 'bold' : '500', fontSize: 15 }}>{option}</Text>
                            </TouchableOpacity>
                          );
                        })}
      </View>
      </View>
                  </Pressable>
                </Modal>
      </View>
      </View>
            {/* Live Circular Calories Indicator */}
            <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#CDECF6', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 32 }}>{maxCalories}</Text>
              <Text style={{ color: '#888', fontSize: 16, marginTop: 2 }}>Calories</Text>
            </View>
          </View>
          {/* Two Small Cards Row */}
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            {/* Centered Today's Calories Card (Live) */}
            <View style={{
              flex: 1,
              backgroundColor: '#fff',
              borderRadius: 14,
              padding: 24,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
              borderWidth: 1,
              borderColor: '#F2F2F2',
              minWidth: 0,
            }}>
              <Text style={{ color: '#FFA500', fontWeight: 'bold', fontSize: 18, letterSpacing: 1, marginBottom: 10 }}>Today's Calories</Text>
              <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 44, textAlign: 'center', marginBottom: 2 }}>{caloriesConsumed}</Text>
              <Text style={{ color: '#888', fontSize: 22, fontWeight: '500', textAlign: 'center' }}>Kcal</Text>
            </View>
          </View>
        </View>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120 }}>
          {meals.filter(m => ['Breakfast', 'Lunch', 'Dinner', 'Evening Snacks'].includes(m.name)).map((meal) => {
            // Icon logic
            let icon = '🍴';
            if (meal.icon === 'wb-sunny') icon = '☀️';
            else if (meal.icon === 'restaurant') icon = '🍱';
            else if (meal.icon === 'dinner-dining') icon = '🍽️';
            else if (meal.icon === 'coffee') icon = '☕';
            // Card color logic
            const cardStyle = meal.name === 'Breakfast'
              ? {
                  backgroundColor: '#FFEBB4',
                  borderRadius: 20,
                  marginBottom: 12,
                  marginTop: 4,
                  padding: 0,
                  borderWidth: 1.5,
                  borderColor: '#FFA726',
                  shadowColor: '#FFA726',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.12,
                  shadowRadius: 8,
                  elevation: 3,
                }
              : meal.name === 'Lunch'
              ? {
                  backgroundColor: '#E0F5E9',
                  borderRadius: 20,
                  marginBottom: 12,
                  marginTop: 4,
                  padding: 0,
                  borderWidth: 1.5,
                  borderColor: '#66BB6A',
                  shadowColor: '#66BB6A',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.12,
                  shadowRadius: 8,
                  elevation: 3,
                }
              : meal.name === 'Dinner'
              ? {
                  backgroundColor: '#E3F2FD',
                  borderRadius: 20,
                  marginBottom: 12,
                  marginTop: 4,
                  padding: 0,
                  borderWidth: 1.5,
                  borderColor: '#1976D2',
                  shadowColor: '#1976D2',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.12,
                  shadowRadius: 8,
                  elevation: 3,
                }
              : {
                  backgroundColor: '#EAFCD9',
                  borderRadius: 20,
                  marginBottom: 12,
                  marginTop: 4,
                  padding: 0,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                };
            return (
              <View key={meal.id} style={cardStyle}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setViewMealModal({ visible: true, meal })}
                  style={{ flex: 1 }}
                >
                  {/* Top Row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 0 }}>
                    {/* Meal Icon */}
                    <View style={{
                      width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff',
                      justifyContent: 'center', alignItems: 'center', marginRight: 10,
                      borderWidth: 1, borderColor: '#E0E0E0',
                    }}>
                      <Text style={{ fontSize: 22 }}>{icon}</Text>
                    </View>
                    {/* Meal Name and Calories */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 17, color: '#222', marginBottom: 0 }}>{meal.name}</Text>
                  <Text style={{ color: '#222', fontSize: 14, fontWeight: '400' }}>{meal.calories} calories</Text>
                </View>
                    {/* Plus Button */}
                <TouchableOpacity
                      style={{
                        backgroundColor: '#fff',
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 1.5,
                        borderColor: '#E0E0E0',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.08,
                        shadowRadius: 2,
                        marginLeft: 8,
                      }}
                  onPress={() => handleAddMeal(meal.id)}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: '#222', fontSize: 26, fontWeight: 'bold', marginTop: -2 }}>+</Text>
                </TouchableOpacity>
              </View>
                </TouchableOpacity>
                {/* Macros Row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 0 }}>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 18 }}>{meal.macros?.protein || 0}</Text>
                    <Text style={{ color: '#222', fontSize: 13, marginTop: 2 }}>Proteins</Text>
            </View>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 18 }}>{meal.macros?.fat || 0}</Text>
                    <Text style={{ color: '#222', fontSize: 13, marginTop: 2 }}>Fats</Text>
        </View>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 18 }}>{meal.macros?.carbs || 0}</Text>
                    <Text style={{ color: '#222', fontSize: 13, marginTop: 2 }}>Carbs</Text>
                  </View>
                </View>
                {/* Bottom Row: Date Button */}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 12, paddingTop: 16 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 6,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#E0E0E0',
                    }}
                    onPress={() => setShowCalendar(true)}
                  >
                    <Text style={{ color: '#222', fontWeight: '500', fontSize: 14 }}>{formattedDate}</Text>
                    <Text style={{ color: '#222', fontSize: 14, marginLeft: 4 }}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {currentScreen === 'main' ? (
        <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
          {renderContent()}
      </ScrollView>
      ) : (
        <DietScreen caloriesLeft={maxCalories - caloriesConsumed} goal={selectedGoal} selectedMeals={meals} />
      )}
      {renderCalendarModal()}
      {showMealOptions && (
        <FoodListModal
          visible={true}
          mealType={meals.find(m => m.id === showMealOptions)?.name || ''}
          onClose={() => setShowMealOptions(null)}
          onSelect={(food) => handleSelectFood(showMealOptions, food)}
        />
      )}
      {/* Redesigned Floating Bottom Navigation Bar with Two Icons */}
      <View style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 18,
        alignItems: 'center',
        zIndex: 100,
      }}>
        <View style={{
          flexDirection: 'row',
          backgroundColor: '#fff',
          borderRadius: 36,
          paddingHorizontal: 32,
          paddingVertical: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 8,
          minWidth: 160,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {/* User Icon - Highlighted */}
          <TouchableOpacity
            onPress={() => setCurrentScreen('main')}
            accessibilityLabel="Profile"
            style={currentScreen === 'main' ? {
              backgroundColor: '#FFF7CC',
              borderRadius: 24,
              width: 48,
              height: 48,
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 8,
              borderWidth: 2,
              borderColor: '#FFF3B0',
              shadowColor: '#FFD600',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
              elevation: 4,
            } : {
              backgroundColor: '#fff',
              borderRadius: 24,
              width: 48,
              height: 48,
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 8,
              borderWidth: 1.5,
              borderColor: '#F2F2F2',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 2,
              elevation: 2,
            }}>
            <Image source={currentScreen === 'main' ? require('./assets/navbar/Account-2c.png') : require('./assets/navbar/Account.png')} style={{ width: 26, height: 26 }} resizeMode="contain" />
          </TouchableOpacity>
          {/* Calendar Icon */}
          <TouchableOpacity
            onPress={() => setCurrentScreen('diet1')}
            accessibilityLabel="Calendar"
            style={currentScreen === 'diet1' ? {
              backgroundColor: '#FFF7CC',
              borderRadius: 24,
              width: 48,
              height: 48,
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 8,
              borderWidth: 2,
              borderColor: '#FFF3B0',
              shadowColor: '#FFD600',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
              elevation: 4,
            } : {
              backgroundColor: '#fff',
              borderRadius: 24,
              width: 48,
              height: 48,
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 8,
              borderWidth: 1.5,
              borderColor: '#F2F2F2',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 2,
              elevation: 2,
            }}>
            <Image source={currentScreen === 'diet1' ? require('./assets/navbar/HealthyFood-2c.png') : require('./assets/navbar/HealthyFood.png')} style={{ width: 26, height: 26 }} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </View>
      {viewMealModal.visible && viewMealModal.meal && (
        <Modal
          visible={viewMealModal.visible}
          transparent
          animationType="slide"
          onRequestClose={() => setViewMealModal({ visible: false, meal: null })}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.25)' }}>
            <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, minHeight: 320, maxHeight: '80%', width: '100%', alignSelf: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 16, overflow: 'hidden' }}>
              {/* Title and subtitle */}
              <View style={{ width: '100%', paddingHorizontal: 0, paddingTop: 32, paddingBottom: 8, alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 2 }}>{viewMealModal.meal.name} Items</Text>
                <Text style={{ color: '#888', fontSize: 16, marginBottom: 16, textAlign: 'center' }}>Selected food items and quantities</Text>
              </View>
              {/* Items list */}
              <View style={{ width: '100%', flex: 1, marginBottom: 18, paddingHorizontal: 24 }}>
                <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
                  {viewMealModal.meal && viewMealModal.meal.items && viewMealModal.meal.items.length > 0 ? (
                    viewMealModal.meal.items.map((item: any, idx: number) => {
                      // Try to parse portion as a number, fallback to 1 if not possible
                      let portionNum = 1;
                      if (item.portions && /^\d+$/.test(item.portions)) {
                        portionNum = parseInt(item.portions);
                      }
                      return (
                        <View key={item.id} style={{ width: '100%' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 }}>
                            <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#222', flex: 1 }} numberOfLines={2} ellipsizeMode="tail">{item.name || 'Food Item'}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: 120, justifyContent: 'flex-end' }}>
                  <TouchableOpacity
                                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#F2F2F2', justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 }}
                    onPress={() => {
                                  if (viewMealModal.meal && portionNum > 0) {
                                    let newItems;
                                    if (portionNum === 1) {
                                      newItems = viewMealModal.meal.items.filter((it: any) => it.id !== item.id);
                                    } else {
                                      newItems = viewMealModal.meal.items.map((it: any) =>
                                        it.id === item.id
                                          ? { ...it, portions: (portionNum - 1).toString() }
                                          : it
                                      );
                                    }
                                    let newCalories = 0;
                                    let newMacros = { carbs: 0, protein: 0, fat: 0 };
                                    for (const it of newItems) {
                                      const qty = parseInt(it.portions) || 1;
                                      newCalories += it.calories * qty;
                                      newMacros.carbs += (it.macros?.carbs || 0) * qty;
                                      newMacros.protein += (it.macros?.protein || 0) * qty;
                                      newMacros.fat += (it.macros?.fat || 0) * qty;
                                    }
                                    const newMeals = { ...mealsData };
                                    const mealArr = newMeals[selectedDate].map(m => {
                                      if (m.id === viewMealModal.meal?.id) {
                                        return { ...m, items: newItems, calories: newCalories, macros: newMacros };
                                      }
                                      return m;
                                    });
                                    setMealsData({ ...mealsData, [selectedDate]: mealArr });
                                    setViewMealModal({ ...viewMealModal, meal: { ...viewMealModal.meal, items: newItems, calories: newCalories, macros: newMacros, id: viewMealModal.meal.id, name: viewMealModal.meal.name, isPlanned: viewMealModal.meal.isPlanned, icon: viewMealModal.meal.icon } });
                                  }
                                }}
                              >
                                <Text style={{ fontSize: 20, color: '#888', fontWeight: 'bold' }}>-</Text>
                  </TouchableOpacity>
                              <Text style={{ fontSize: 17, color: '#888', minWidth: 40, textAlign: 'center' }}>{portionNum}</Text>
                              <TouchableOpacity
                                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFA500', justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 }}
                                onPress={() => {
                                  if (viewMealModal.meal) {
                                    const newItems = viewMealModal.meal.items.map((it: any) =>
                                      it.id === item.id
                                        ? { ...it, portions: (portionNum + 1).toString() }
                                        : it
                                    );
                                    let newCalories = 0;
                                    let newMacros = { carbs: 0, protein: 0, fat: 0 };
                                    for (const it of newItems) {
                                      const qty = parseInt(it.portions) || 1;
                                      newCalories += it.calories * qty;
                                      newMacros.carbs += (it.macros?.carbs || 0) * qty;
                                      newMacros.protein += (it.macros?.protein || 0) * qty;
                                      newMacros.fat += (it.macros?.fat || 0) * qty;
                                    }
                                    const newMeals = { ...mealsData };
                                    const mealArr = newMeals[selectedDate].map(m => {
                                      if (m.id === viewMealModal.meal?.id) {
                                        return { ...m, items: newItems, calories: newCalories, macros: newMacros };
                                      }
                                      return m;
                                    });
                                    setMealsData({ ...mealsData, [selectedDate]: mealArr });
                                    setViewMealModal({ ...viewMealModal, meal: { ...viewMealModal.meal, items: newItems, calories: newCalories, macros: newMacros, id: viewMealModal.meal.id, name: viewMealModal.meal.name, isPlanned: viewMealModal.meal.isPlanned, icon: viewMealModal.meal.icon } });
                                  }
                                }}
                              >
                                <Text style={{ fontSize: 20, color: '#fff', fontWeight: 'bold' }}>+</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                          {viewMealModal.meal && idx !== viewMealModal.meal.items.length - 1 && (
                            <View style={{ height: 1, backgroundColor: '#F2F2F2', width: '100%' }} />
                          )}
                        </View>
                      );
                    })
                  ) : (
                    <Text style={{ color: '#888', fontSize: 16, textAlign: 'center', marginTop: 24 }}>No items added yet.</Text>
                  )}
              </ScrollView>
              </View>
              {/* Close button */}
              <View style={{ width: '100%', paddingHorizontal: 24, marginBottom: 8 }}>
              <TouchableOpacity
                  style={{ backgroundColor: '#FFA500', borderRadius: 16, paddingVertical: 18, alignItems: 'center', width: '100%' }}
                  onPress={() => setViewMealModal({ visible: false, meal: null })}
              >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>Close</Text>
              </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  weekViewContainer: {
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  weekHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  weekViewText: {
    fontSize: 15,
    color: colors.text,
    marginRight: 4,
    fontWeight: 'bold',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  dayButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 24,
    minWidth: 40,
  },
  selectedDay: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  selectedDayText: {
    color: colors.background,
  },
  dateDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.dotIndicator,
    marginTop: 4,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginHorizontal: 20,
    marginTop: 8,
    height: 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  calorieDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    paddingRight: 20,
  },
  calorieNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
  },
  calorieLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    fontWeight: '500',
  },
  macrosContainer: {
    flex: 1,
    paddingLeft: Platform.OS === 'ios' ? 10 : 20,
    justifyContent: 'center',
  },
  macroItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 12,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    width: 60,
    marginRight: 8,
  },
  macroAmount: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFA500',
    marginBottom: 16,
    alignSelf: 'flex-start',
    fontFamily: 'MinecraftTen',
  },
  mealsList: {
    paddingBottom: 20,
  },
  mealItemContainer: {
    width: '100%',
    marginBottom: 12,
  },
  mealItem: {
    backgroundColor: colors.mealItemBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  mealItemExpanded: {
    marginBottom: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  mealItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.progressBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  calorieText: {
    fontSize: 14,
    color: colors.textLight,
  },
  mealActionButton: {
    width: 32,
    height: 32,
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
  mealEmoji: {
    fontSize: 20,
  },
  expandedContent: {
    backgroundColor: colors.mealItemBg,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 12,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  mealItemDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mealItemDetailLeft: {
    flex: 1,
    marginRight: 16,
  },
  mealItemDetailName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  mealItemDetailPortions: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  macroTags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
    flexWrap: 'nowrap'
  },
  macroTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center'
  },
  macroTagText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center'
  },
  mealItemDetailRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealItemDetailCalories: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  addMoreText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  foodList: {
    paddingHorizontal: 16,
  },
  foodItemCard: {
    backgroundColor: '#546D64',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  foodItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  foodItemInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  foodCalories: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  foodItemIngredients: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  selectedIngredient: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  ingredientLeft: {
    flex: 1,
    marginRight: 16,
  },
  ingredientNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  ingredientInfo: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  quantityButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  quantityText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    minWidth: 24,
    textAlign: 'center',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8, // This adds space between name and badge
    // Optionally, add marginTop: 1 or 2 to align vertically
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  selectedDayDot: {
    backgroundColor: colors.background,
  },
  todayText: {
    color: colors.primary,
    fontWeight: '500',
  },
  todaySelectedDay: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  todaySelectedDayText: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  calendarContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  calendarHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    right: 20,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  removeButtonText: {
    fontSize: 24,
    color: colors.carbs,
    fontWeight: 'bold',
  },
  quoteContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(247, 219, 167, 0.1)',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
  },
  quoteText: {
    fontSize: 14,
    color: '#F7DBA7',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  dietSelector: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dietButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  dietButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.progressBg,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDietButton: {
    backgroundColor: colors.primary,
  },
  dietButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  activeDietButtonText: {
    color: colors.background,
    fontWeight: '600',
  },
});

export default App;