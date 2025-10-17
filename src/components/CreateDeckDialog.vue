<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="create-deck-card">
      <q-card-section class="dialog-header">
        <h3 class="dialog-title">Create New Deck</h3>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="deckName"
          label="Deck Name"
          outlined
          dark
          color="purple-4"
          :rules="[(val) => !!val || 'Deck name is required']"
          @keyup.enter="handleCreate"
          autofocus
        />

        <q-input
          v-model="deckDescription"
          label="Description (optional)"
          type="textarea"
          outlined
          dark
          color="purple-4"
          rows="3"
          class="q-mt-md"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn
          flat
          label="Cancel"
          color="grey-7"
          @click="handleCancel"
          :disable="creating"
        />
        <q-btn
          unelevated
          label="Create"
          class="create-btn"
          @click="handleCreate"
          :loading="creating"
          :disable="!deckName.trim()"
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
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const deckStore = useDeckStore()

const deckName = ref('')
const deckDescription = ref('')
const creating = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Reset form when dialog opens
watch(isOpen, (newValue) => {
  if (newValue) {
    deckName.value = ''
    deckDescription.value = ''
    creating.value = false
  }
})

const handleCreate = async () => {
  if (!deckName.value.trim()) {
    return
  }

  try {
    creating.value = true
    await deckStore.createDeck({
      name: deckName.value.trim(),
      description: deckDescription.value.trim() || undefined,
    })

    Notify.create({
      type: 'positive',
      message: 'Deck created successfully!',
      position: 'top',
    })

    isOpen.value = false
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Failed to create deck',
      position: 'top',
    })
  } finally {
    creating.value = false
  }
}

const handleCancel = () => {
  isOpen.value = false
}
</script>

<style scoped>
.create-deck-card {
  min-width: 400px;
  max-width: 500px;
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

.create-btn {
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

@media (max-width: 500px) {
  .create-deck-card {
    min-width: unset;
    width: 100%;
  }
}
</style>
