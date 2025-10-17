<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="add-card-card">
      <q-card-section class="dialog-header">
        <h3 class="dialog-title">Add New Card</h3>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="cardTitle"
          label="Front (Question/Term)"
          type="textarea"
          outlined
          dark
          color="purple-4"
          rows="5"
          :rules="[(val) => !!val || 'Front is required']"
          autofocus
        />

        <q-input
          v-model="cardDescription"
          label="Back (Answer/Definition)"
          type="textarea"
          outlined
          dark
          color="purple-4"
          rows="5"
          class="q-mt-md"
          :rules="[(val) => !!val || 'Back is required']"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn
          flat
          label="Cancel"
          color="grey-7"
          @click="handleCancel"
          :disable="adding"
        />
        <q-btn
          unelevated
          label="Add Card"
          class="add-btn"
          @click="handleAdd"
          :loading="adding"
          :disable="!cardTitle.trim() || !cardDescription.trim()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDeckStore } from '../stores/deck'
import { Notify } from 'quasar'

const props = defineProps<{
  modelValue: boolean
  deckId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const deckStore = useDeckStore()

const cardTitle = ref('')
const cardDescription = ref('')
const adding = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Reset form when dialog opens
watch(isOpen, (newValue) => {
  if (newValue) {
    cardTitle.value = ''
    cardDescription.value = ''
    adding.value = false
  }
})

const handleAdd = async () => {
  if (!cardTitle.value.trim() || !cardDescription.value.trim()) {
    return
  }

  if (!props.deckId) {
    Notify.create({
      type: 'negative',
      message: 'Invalid deck ID',
      position: 'top',
    })
    return
  }

  try {
    adding.value = true
    await deckStore.createCard({
      deckId: props.deckId,
      title: cardTitle.value.trim(),
      description: cardDescription.value.trim(),
    })

    Notify.create({
      type: 'positive',
      message: 'Card added successfully!',
      position: 'top',
    })

    isOpen.value = false
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Failed to add card',
      position: 'top',
    })
  } finally {
    adding.value = false
  }
}

const handleCancel = () => {
  isOpen.value = false
}
</script>

<style scoped>
.add-card-card {
  min-width: 500px;
  max-width: 600px;
  background: #1e293b;
  color: white;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.dialog-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: white;
}

.add-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
}

/* Make input labels and text white/visible */
:deep(.q-field__label) {
  color: #94a3b8;
}

:deep(.q-field__control) {
  color: white;
}

:deep(.q-field__native) {
  color: white;
}

@media (max-width: 600px) {
  .add-card-card {
    min-width: unset;
    width: 100%;
  }
}
</style>
