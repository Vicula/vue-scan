<script setup>
import { ref, reactive, computed } from 'vue';

// Form state
const formData = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  age: null,
  interests: [],
  bio: '',
  terms: false,
});

// Form validation state
const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  age: '',
  interests: '',
  bio: '',
  terms: '',
});

// Form submission state
const isSubmitting = ref(false);
const isSubmitted = ref(false);
const serverError = ref('');

// Available interests for checkbox selection
const availableInterests = [
  { id: 1, label: 'Programming' },
  { id: 2, label: 'Design' },
  { id: 3, label: 'Marketing' },
  { id: 4, label: 'Business' },
  { id: 5, label: 'Education' },
];

// Computed properties
const isFormValid = computed(() => {
  return (
    !errors.name &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword &&
    !errors.age &&
    !errors.interests &&
    !errors.bio &&
    !errors.terms &&
    formData.name &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.age &&
    formData.interests.length > 0 &&
    formData.terms
  );
});

// Validation methods
function validateName() {
  if (!formData.name) {
    errors.name = 'Name is required';
  } else if (formData.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else {
    errors.name = '';
  }
}

function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  } else {
    errors.email = '';
  }
}

function validatePassword() {
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else {
    errors.password = '';
  }

  // Also validate confirm password if it has a value
  if (formData.confirmPassword) {
    validateConfirmPassword();
  }
}

function validateConfirmPassword() {
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.confirmPassword !== formData.password) {
    errors.confirmPassword = 'Passwords do not match';
  } else {
    errors.confirmPassword = '';
  }
}

function validateAge() {
  if (!formData.age) {
    errors.age = 'Age is required';
  } else if (isNaN(formData.age) || formData.age < 18 || formData.age > 120) {
    errors.age = 'Please enter a valid age (18-120)';
  } else {
    errors.age = '';
  }
}

function validateInterests() {
  if (formData.interests.length === 0) {
    errors.interests = 'Please select at least one interest';
  } else {
    errors.interests = '';
  }
}

function validateBio() {
  if (formData.bio && formData.bio.length > 500) {
    errors.bio = 'Bio cannot exceed 500 characters';
  } else {
    errors.bio = '';
  }
}

function validateTerms() {
  if (!formData.terms) {
    errors.terms = 'You must accept the terms and conditions';
  } else {
    errors.terms = '';
  }
}

function validateAll() {
  validateName();
  validateEmail();
  validatePassword();
  validateConfirmPassword();
  validateAge();
  validateInterests();
  validateBio();
  validateTerms();
}

// Form submission
async function submitForm() {
  validateAll();

  if (!isFormValid.value) {
    return;
  }

  isSubmitting.value = true;
  serverError.value = '';

  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate successful submission
    console.log('Form submitted:', formData);
    isSubmitted.value = true;

    // For testing error handling, uncomment the following line:
    // throw new Error('Server is currently unavailable. Please try again later.');
  } catch (error) {
    serverError.value =
      error.message || 'An error occurred while submitting the form';
    console.error(serverError.value);
  } finally {
    isSubmitting.value = false;
  }
}

function resetForm() {
  // Reset form data
  Object.keys(formData).forEach((key) => {
    if (key === 'interests') {
      formData[key] = [];
    } else if (key === 'age') {
      formData[key] = null;
    } else if (key === 'terms') {
      formData[key] = false;
    } else {
      formData[key] = '';
    }
  });

  // Reset validation errors
  Object.keys(errors).forEach((key) => {
    errors[key] = '';
  });

  // Reset submission state
  isSubmitted.value = false;
  serverError.value = '';
}
</script>

<template>
  <div class="form-container">
    <h2>Registration Form</h2>
    
    <div v-if="isSubmitted" class="success-message">
      <h3>Registration Successful!</h3>
      <p>Thank you for registering. Your information has been submitted.</p>
      <button @click="resetForm" class="btn">Start Over</button>
    </div>
    
    <form v-else @submit.prevent="submitForm" novalidate>
      <div v-if="serverError" class="error-message">
        {{ serverError }}
      </div>
      
      <div class="form-group">
        <label for="name">Name *</label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          @blur="validateName"
          :class="{ 'input-error': errors.name }"
        />
        <div v-if="errors.name" class="error-text">{{ errors.name }}</div>
      </div>
      
      <div class="form-group">
        <label for="email">Email *</label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          @blur="validateEmail"
          :class="{ 'input-error': errors.email }"
        />
        <div v-if="errors.email" class="error-text">{{ errors.email }}</div>
      </div>
      
      <div class="form-row">
        <div class="form-group form-group-half">
          <label for="password">Password *</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            @blur="validatePassword"
            :class="{ 'input-error': errors.password }"
          />
          <div v-if="errors.password" class="error-text">{{ errors.password }}</div>
        </div>
        
        <div class="form-group form-group-half">
          <label for="confirm-password">Confirm Password *</label>
          <input
            id="confirm-password"
            v-model="formData.confirmPassword"
            type="password"
            @blur="validateConfirmPassword"
            :class="{ 'input-error': errors.confirmPassword }"
          />
          <div v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</div>
        </div>
      </div>
      
      <div class="form-group">
        <label for="age">Age *</label>
        <input
          id="age"
          v-model.number="formData.age"
          type="number"
          min="18"
          max="120"
          @blur="validateAge"
          :class="{ 'input-error': errors.age }"
        />
        <div v-if="errors.age" class="error-text">{{ errors.age }}</div>
      </div>
      
      <div class="form-group">
        <label>Interests *</label>
        <div class="checkbox-group">
          <div 
            v-for="interest in availableInterests" 
            :key="interest.id"
            class="checkbox-item"
          >
            <input
              :id="`interest-${interest.id}`"
              type="checkbox"
              :value="interest.label"
              v-model="formData.interests"
              @change="validateInterests"
            />
            <label :for="`interest-${interest.id}`">{{ interest.label }}</label>
          </div>
        </div>
        <div v-if="errors.interests" class="error-text">{{ errors.interests }}</div>
      </div>
      
      <div class="form-group">
        <label for="bio">Bio (optional)</label>
        <textarea
          id="bio"
          v-model="formData.bio"
          rows="4"
          @blur="validateBio"
          :class="{ 'input-error': errors.bio }"
        ></textarea>
        <div class="char-count" :class="{ 'char-count-error': formData.bio.length > 500 }">
          {{ formData.bio.length }}/500 characters
        </div>
        <div v-if="errors.bio" class="error-text">{{ errors.bio }}</div>
      </div>
      
      <div class="form-group">
        <div class="checkbox-item terms-checkbox">
          <input
            id="terms"
            type="checkbox"
            v-model="formData.terms"
            @change="validateTerms"
          />
          <label for="terms">I agree to the terms and conditions *</label>
        </div>
        <div v-if="errors.terms" class="error-text">{{ errors.terms }}</div>
      </div>
      
      <div class="form-actions">
        <button 
          type="submit" 
          class="btn btn-primary" 
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Submitting...' : 'Register' }}
        </button>
        <button 
          type="button"
          @click="resetForm"
          class="btn btn-secondary"
          :disabled="isSubmitting"
        >
          Reset
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-group-half {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input[type="text"],
input[type="email"],
input[type="password"],
input[type="number"],
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.input-error {
  border-color: #f44336;
}

.error-text {
  color: #f44336;
  font-size: 14px;
  margin-top: 5px;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.terms-checkbox {
  margin-top: 5px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #4caf50;
  color: white;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #f44336;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 20px;
  border-radius: 4px;
  text-align: center;
  border: 1px solid #4caf50;
}

.success-message h3 {
  margin-top: 0;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.char-count-error {
  color: #f44336;
}
</style> 