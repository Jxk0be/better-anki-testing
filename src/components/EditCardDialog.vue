<template>
  <q-dialog v-model="dialogOpen" persistent>
    <q-card class="edit-card-dialog">
      <q-card-section class="dialog-header">
        <div class="dialog-title">Edit Card</div>
      </q-card-section>

      <q-card-section class="dialog-content">
        <q-form @submit="handleSubmit" class="card-form">
          <div class="form-group">
            <label class="form-label">Front (Question)</label>
            <q-input
              v-model="formData.title"
              filled
              type="textarea"
              rows="4"
              placeholder="Enter the question or prompt"
              class="form-input"
              :rules="[val => !!val || 'Front is required']"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Back (Answer)</label>
            <q-input
              v-model="formData.description"
              filled
              type="textarea"
              rows="4"
              placeholder="Enter the answer or explanation"
              class="form-input"
              :rules="[val => !!val || 'Back is required']"
            />
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="dialog-actions">
        <q-btn
          flat
          label="Cancel"
          color="grey"
          @click="handleCancel"
          :disable="loading"
        />
        <q-btn
          unelevated
          label="Save Changes"
          class="save-btn"
          @click="handleSubmit"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDeckStore } from '../stores/deck'
import { Card } from '../types/deck'
import { Notify } from 'quasar'

const props = defineProps<{
  modelValue: boolean
  card: Card
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const deckStore = useDeckStore()
const dialogOpen = ref(props.modelValue)
const loading = ref(false)

const formData = ref({
  title: props.card.title,
  description: props.card.description,
})

watch(() => props.modelValue, (newVal) => {
  dialogOpen.value = newVal
  if (newVal) {
    // Reset form data when dialog opens
    formData.value = {
      title: props.card.title,
      description: props.card.description,
    }
  }
})

watch(dialogOpen, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleCancel = () => {
  dialogOpen.value = false
}

const handleSubmit = async () => {
  if (!formData.value.title || !formData.value.description) {
    Notify.create({
      type: 'warning',
      message: 'Please fill in all fields',
      position: 'top',
    })
    return
  }

  try {
    loading.value = true
    await deckStore.updateCard(props.card.id!, {
      title: formData.value.title,
      description: formData.value.description,
    })

    Notify.create({
      type: 'positive',
      message: 'Card updated successfully',
      position: 'top',
    })

    dialogOpen.value = false
  } catch (error) {
    console.error('Error updating card:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to update card',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.edit-card-dialog {
  min-width: 500px;
  max-width: 600px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.dialog-header {
  background: rgba(102, 126, 234, 0.1);
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
  padding: 1.5rem;
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.dialog-content {
  padding: 2rem;
}

.card-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
}

.form-input :deep(.q-field__control:hover) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(102, 126, 234, 0.3);
}

.form-input :deep(.q-field__native) {
  color: white;
}

.form-input :deep(.q-placeholder) {
  color: #64748b;
}

.dialog-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  text-transform: none;
}

@media (max-width: 640px) {
  .edit-card-dialog {
    min-width: unset;
    width: 100%;
    max-width: 100%;
  }

  .dialog-content {
    padding: 1.5rem;
  }
}
</style>
