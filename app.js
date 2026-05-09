const STORAGE_KEY = "fuelfit-static-profile";
const PLAN_KEY = "fuelfit-static-meal-plan";
const PLAN_COUNTER_KEY = "fuelfit-static-plan-counter";

const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

const GOAL_TEXT = {
  cut: "Cutting",
  maintain: "Maintaining",
  bulk: "Bulking",
};

const MEALS = [
  { id: 1, name: "Greek Yogurt Power Bowl", description: "Greek yogurt, berries, oats, chia, and honey.", meal_type: "breakfast", goal_type: "all", calories: 470, protein_g: 34, carbs_g: 58, fat_g: 12 },
  { id: 2, name: "Egg White Veggie Wrap", description: "Egg whites, spinach, peppers, salsa, and whole wheat wrap.", meal_type: "breakfast", goal_type: "cut", calories: 360, protein_g: 32, carbs_g: 35, fat_g: 9 },
  { id: 3, name: "Salmon Avocado Toast", description: "Smoked salmon, avocado, egg, and grain toast.", meal_type: "breakfast", goal_type: "maintain", calories: 520, protein_g: 33, carbs_g: 42, fat_g: 24 },
  { id: 4, name: "Mass Gainer Oatmeal", description: "Oats, banana, peanut butter, whey, and milk.", meal_type: "breakfast", goal_type: "bulk", calories: 760, protein_g: 46, carbs_g: 92, fat_g: 24 },
  { id: 5, name: "Chicken Rice Bowl", description: "Grilled chicken, brown rice, beans, salsa, and greens.", meal_type: "lunch", goal_type: "all", calories: 650, protein_g: 52, carbs_g: 73, fat_g: 16 },
  { id: 6, name: "Turkey Lettuce Burger Plate", description: "Turkey patties, roasted potatoes, salad, and yogurt sauce.", meal_type: "lunch", goal_type: "cut", calories: 510, protein_g: 48, carbs_g: 45, fat_g: 15 },
  { id: 7, name: "Tuna Pasta Salad", description: "Tuna, chickpea pasta, cucumber, tomato, and olive oil.", meal_type: "lunch", goal_type: "maintain", calories: 620, protein_g: 45, carbs_g: 62, fat_g: 20 },
  { id: 8, name: "Steak Burrito Bowl", description: "Lean steak, rice, beans, corn, guacamole, and cheese.", meal_type: "lunch", goal_type: "bulk", calories: 850, protein_g: 58, carbs_g: 88, fat_g: 30 },
  { id: 9, name: "Lean Turkey Chili", description: "Turkey, beans, tomatoes, peppers, and light cheese.", meal_type: "dinner", goal_type: "cut", calories: 540, protein_g: 50, carbs_g: 52, fat_g: 14 },
  { id: 10, name: "Shrimp Stir Fry", description: "Shrimp, mixed vegetables, rice noodles, and sesame sauce.", meal_type: "dinner", goal_type: "maintain", calories: 610, protein_g: 42, carbs_g: 70, fat_g: 18 },
  { id: 11, name: "Chicken Sweet Potato Plate", description: "Chicken breast, sweet potato, broccoli, and olive oil.", meal_type: "dinner", goal_type: "all", calories: 690, protein_g: 56, carbs_g: 68, fat_g: 19 },
  { id: 12, name: "Pesto Chicken Pasta", description: "Chicken, pasta, pesto, peas, and parmesan.", meal_type: "dinner", goal_type: "bulk", calories: 900, protein_g: 60, carbs_g: 96, fat_g: 30 },
  { id: 13, name: "Protein Smoothie", description: "Whey, milk, banana, berries, and spinach.", meal_type: "snack", goal_type: "all", calories: 330, protein_g: 30, carbs_g: 40, fat_g: 6 },
  { id: 14, name: "Cottage Cheese Crunch", description: "Cottage cheese, berries, and a small granola topping.", meal_type: "snack", goal_type: "cut", calories: 260, protein_g: 29, carbs_g: 24, fat_g: 5 },
  { id: 15, name: "Hummus Turkey Plate", description: "Turkey slices, hummus, carrots, cucumbers, and pita.", meal_type: "snack", goal_type: "maintain", calories: 390, protein_g: 31, carbs_g: 38, fat_g: 13 },
  { id: 16, name: "Peanut Butter Shake", description: "Whey, milk, oats, banana, and peanut butter.", meal_type: "snack", goal_type: "bulk", calories: 620, protein_g: 42, carbs_g: 64, fat_g: 22 },
  { id: 17, name: "Apple Almond Protein Box", description: "Apple, almonds, boiled eggs, and cheese.", meal_type: "snack", goal_type: "all", calories: 410, protein_g: 25, carbs_g: 30, fat_g: 22 },
  { id: 18, name: "Tofu Quinoa Bowl", description: "Tofu, quinoa, edamame, greens, and ginger dressing.", meal_type: "lunch", goal_type: "all", calories: 640, protein_g: 38, carbs_g: 70, fat_g: 22 },
];

const state = {
  profile: null,
  mealPlan: null,
};

const $ = (selector) => document.querySelector(selector);

const elements = {
  profileForm: $("#profileForm"),
  generatePlanBtn: $("#generatePlanBtn"),
  metricsGrid: $("#metricsGrid"),
  macroBlock: $("#macroBlock"),
  macroCanvas: $("#macroCanvas"),
  macroBars: $("#macroBars"),
  mealList: $("#mealList"),
  planDate: $("#planDate"),
  statusLine: $("#statusLine"),
};

function setStatus(message, isError = false) {
  elements.statusLine.textContent = message || "";
  elements.statusLine.classList.toggle("error", isError);
}

function localDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function validateProfile(data) {
  const profile = {
    age: Number(data.age),
    height_cm: Number(data.height_cm),
    current_weight_kg: Number(data.current_weight_kg),
    goal_weight_kg: Number(data.goal_weight_kg),
    sex: data.sex,
    activity_level: data.activity_level,
    goal_type: data.goal_type,
  };

  if (!Number.isInteger(profile.age) || profile.age < 13 || profile.age > 100) {
    throw new Error("Age must be between 13 and 100.");
  }
  if (profile.height_cm < 90 || profile.height_cm > 250) {
    throw new Error("Height must be between 90 cm and 250 cm.");
  }
  if (profile.current_weight_kg < 30 || profile.current_weight_kg > 300) {
    throw new Error("Current weight must be between 30 kg and 300 kg.");
  }
  if (profile.goal_weight_kg < 30 || profile.goal_weight_kg > 300) {
    throw new Error("Goal weight must be between 30 kg and 300 kg.");
  }
  if (!["male", "female"].includes(profile.sex)) {
    throw new Error("Choose male or female for the calorie calculation.");
  }
  if (!ACTIVITY_FACTORS[profile.activity_level]) {
    throw new Error("Choose a valid activity level.");
  }
  if (!GOAL_TEXT[profile.goal_type]) {
    throw new Error("Choose cutting, maintaining, or bulking.");
  }

  return calculateTargets(profile);
}

function calculateTargets(profile) {
  const heightM = profile.height_cm / 100;
  const bmi = profile.current_weight_kg / (heightM * heightM);
  const bmr =
    10 * profile.current_weight_kg +
    6.25 * profile.height_cm -
    5 * profile.age +
    (profile.sex === "male" ? 5 : -161);
  const tdee = bmr * ACTIVITY_FACTORS[profile.activity_level];

  let targetCalories = Math.round(tdee);
  if (profile.goal_type === "cut") {
    const safeFloor = profile.sex === "male" ? 1400 : 1200;
    targetCalories = Math.max(safeFloor, Math.round(tdee - 450));
  }
  if (profile.goal_type === "bulk") {
    targetCalories = Math.round(tdee + 350);
  }

  const proteinG = Math.round(profile.current_weight_kg * 1.8);
  const fatG = Math.round((targetCalories * 0.25) / 9);
  const carbsG = Math.max(0, Math.round((targetCalories - proteinG * 4 - fatG * 9) / 4));

  return {
    ...profile,
    bmi: Number(bmi.toFixed(1)),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    target_calories: targetCalories,
    protein_g: proteinG,
    carbs_g: carbsG,
    fat_g: fatG,
    updated_at: new Date().toISOString(),
  };
}

function compatibleMeals(mealType, goalType) {
  return MEALS.filter((meal) => meal.meal_type === mealType && ["all", goalType].includes(meal.goal_type));
}

function chooseMeal(candidates, budget, variant, mealType, usedIds) {
  const available = candidates.filter((meal) => !usedIds.has(meal.id));
  const pool = available.length ? available : candidates;
  const ranked = [...pool].sort((a, b) => {
    const calorieDiff = Math.abs(a.calories - budget) - Math.abs(b.calories - budget);
    if (calorieDiff !== 0) return calorieDiff;
    if (a.goal_type !== b.goal_type) return a.goal_type === "all" ? 1 : -1;
    return b.protein_g - a.protein_g;
  });
  const top = ranked.slice(0, Math.min(3, ranked.length));
  const seed = [...`${variant}-${mealType}`].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return top[seed % top.length];
}

function generateMealPlan(profile, variant = 0) {
  const target = profile.target_calories;
  const mealBudgets = [
    ["breakfast", target * 0.25],
    ["lunch", target * 0.3],
    ["dinner", target * 0.3],
    ["snack", target * 0.15],
  ];
  const usedIds = new Set();
  const items = [];

  mealBudgets.forEach(([mealType, budget], index) => {
    const meal = chooseMeal(compatibleMeals(mealType, profile.goal_type), budget, variant, mealType, usedIds);
    usedIds.add(meal.id);
    items.push({ ...meal, servings: 1, sequence: index + 1 });
  });

  const subtotal = items.reduce((sum, meal) => sum + meal.calories, 0);
  if (profile.goal_type === "bulk" && target - subtotal > 250) {
    const snack = chooseMeal(compatibleMeals("snack", profile.goal_type), target - subtotal, variant, "extra-snack", usedIds);
    items.push({ ...snack, servings: 1, sequence: items.length + 1 });
  }

  return {
    plan_date: localDateString(),
    total_calories: items.reduce((sum, meal) => sum + meal.calories, 0),
    total_protein_g: items.reduce((sum, meal) => sum + meal.protein_g, 0),
    total_carbs_g: items.reduce((sum, meal) => sum + meal.carbs_g, 0),
    total_fat_g: items.reduce((sum, meal) => sum + meal.fat_g, 0),
    items,
  };
}

function renderProfile() {
  if (!state.profile) return;

  ["age", "height_cm", "current_weight_kg", "goal_weight_kg", "sex", "activity_level", "goal_type"].forEach((field) => {
    const input = $(`#${field}`);
    if (input && state.profile[field] !== undefined) {
      input.value = state.profile[field];
    }
  });
}

function renderDashboard() {
  if (!state.profile) {
    elements.metricsGrid.innerHTML = "";
    elements.macroBlock.hidden = true;
    elements.planDate.textContent = "";
    elements.mealList.innerHTML = `<div class="empty-state">Save your body details to calculate BMI and build today's meals.</div>`;
    return;
  }

  const metrics = [
    ["BMI", state.profile.bmi, "Body mass index"],
    ["Calories", state.profile.target_calories, "Daily target"],
    ["Goal", GOAL_TEXT[state.profile.goal_type], `${state.profile.current_weight_kg} kg to ${state.profile.goal_weight_kg} kg`],
    ["Protein", `${state.profile.protein_g}g`, "Daily target"],
  ];

  elements.metricsGrid.innerHTML = metrics
    .map(
      ([label, value, helper]) => `
        <article class="metric">
          <span>${label}</span>
          <strong>${value}</strong>
          <small>${helper}</small>
        </article>
      `
    )
    .join("");

  renderMacros();
  renderMealPlan();
}

function renderMacros() {
  elements.macroBlock.hidden = false;
  const macros = [
    { name: "Protein", grams: state.profile.protein_g, calories: state.profile.protein_g * 4, color: "#126b57" },
    { name: "Carbs", grams: state.profile.carbs_g, calories: state.profile.carbs_g * 4, color: "#2f65d6" },
    { name: "Fat", grams: state.profile.fat_g, calories: state.profile.fat_g * 9, color: "#d75f42" },
  ];
  const totalMacroCalories = macros.reduce((sum, macro) => sum + macro.calories, 0);

  elements.macroBars.innerHTML = macros
    .map((macro) => {
      const percent = Math.round((macro.calories / totalMacroCalories) * 100);
      return `
        <div class="macro-row">
          <div class="macro-row-top">
            <span>${macro.name}</span>
            <span>${macro.grams}g · ${percent}%</span>
          </div>
          <div class="macro-track">
            <div class="macro-fill" style="width: ${percent}%; background: ${macro.color};"></div>
          </div>
        </div>
      `;
    })
    .join("");

  drawMacroChart(macros, totalMacroCalories);
}

function drawMacroChart(macros, total) {
  const canvas = elements.macroCanvas;
  const context = canvas.getContext("2d");
  const centerX = 85;
  const centerY = 80;
  const radius = 56;
  let start = -Math.PI / 2;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.lineWidth = 22;
  context.lineCap = "round";

  macros.forEach((macro) => {
    const slice = (macro.calories / total) * Math.PI * 2;
    context.beginPath();
    context.strokeStyle = macro.color;
    context.arc(centerX, centerY, radius, start, start + slice);
    context.stroke();
    start += slice;
  });

  context.fillStyle = "#15201d";
  context.font = "800 22px system-ui";
  context.textAlign = "center";
  context.fillText(`${state.profile.target_calories}`, centerX, centerY - 2);
  context.fillStyle = "#66736f";
  context.font = "800 12px system-ui";
  context.fillText("calories", centerX, centerY + 18);

  context.textAlign = "left";
  context.fillStyle = "#15201d";
  context.font = "900 18px system-ui";
  context.fillText("Macro split", 175, 64);
  context.fillStyle = "#66736f";
  context.font = "600 14px system-ui";
  context.fillText("Protein, carbs, and fats", 175, 88);
  context.fillText("based on your goal.", 175, 110);
}

function renderMealPlan() {
  const plan = state.mealPlan;
  if (!plan) {
    elements.planDate.textContent = "";
    elements.mealList.innerHTML = `<div class="empty-state">No meal plan yet.</div>`;
    return;
  }

  elements.planDate.textContent = plan.plan_date;
  elements.mealList.innerHTML = plan.items
    .map(
      (item) => `
        <article class="meal-card">
          <div class="meal-type ${item.meal_type}">${item.meal_type}</div>
          <div class="meal-copy">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <div class="meal-stats">
              <span>${item.calories} cal</span>
              <span>${item.protein_g}g protein</span>
              <span>${item.carbs_g}g carbs</span>
              <span>${item.fat_g}g fat</span>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function loadSavedState() {
  state.profile = readJson(STORAGE_KEY);
  state.mealPlan = readJson(PLAN_KEY);
  if (state.profile && (!state.mealPlan || state.mealPlan.plan_date !== localDateString())) {
    state.mealPlan = generateMealPlan(state.profile);
    saveJson(PLAN_KEY, state.mealPlan);
  }
  renderProfile();
  renderDashboard();
}

elements.profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  setStatus("");

  try {
    state.profile = validateProfile(formToObject(elements.profileForm));
    state.mealPlan = generateMealPlan(state.profile);
    saveJson(STORAGE_KEY, state.profile);
    saveJson(PLAN_KEY, state.mealPlan);
    renderDashboard();
    setStatus("Profile saved locally and today's meal plan is ready.");
  } catch (error) {
    setStatus(error.message, true);
  }
});

elements.generatePlanBtn.addEventListener("click", () => {
  setStatus("");
  if (!state.profile) {
    setStatus("Save your body details before generating a meal plan.", true);
    return;
  }

  const nextCounter = Number(localStorage.getItem(PLAN_COUNTER_KEY) || 0) + 1;
  localStorage.setItem(PLAN_COUNTER_KEY, String(nextCounter));
  state.mealPlan = generateMealPlan(state.profile, nextCounter);
  saveJson(PLAN_KEY, state.mealPlan);
  renderMealPlan();
  setStatus("Meal plan regenerated locally.");
});

loadSavedState();
