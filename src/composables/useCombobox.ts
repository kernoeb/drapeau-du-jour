import type { ComputedRef, Ref } from 'vue'
import { computed, nextTick, ref, watch } from 'vue'

/**
 * Keyboard and ARIA behaviour for a text input with a suggestion list
 * (the WAI-ARIA combobox pattern): arrows move, Enter picks, Escape closes.
 */
export function useCombobox(id: string, query: Ref<string>, options: ComputedRef<string[]>, canOpen: ComputedRef<boolean>) {
  const active = ref(-1)
  const dismissed = ref(false)

  // Typing again reopens a list closed with Escape and clears the highlight
  watch(query, () => {
    dismissed.value = false
    active.value = -1
  })

  const open = computed(() => canOpen.value && !dismissed.value)
  const listId = `${id}-list`
  const optionId = (index: number) => `${id}-option-${index}`
  const activeId = computed(() => (open.value && active.value >= 0 ? optionId(active.value) : undefined))

  watch(active, async (index) => {
    if (index < 0) return
    await nextTick()
    document.getElementById(optionId(index))?.scrollIntoView({ block: 'nearest' })
  })

  function select(value: string) {
    query.value = value
  }

  function onKeydown(event: KeyboardEvent) {
    if (!open.value) return
    const last = options.value.length - 1
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      active.value = active.value >= last ? 0 : active.value + 1
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      active.value = active.value <= 0 ? last : active.value - 1
    } else if (event.key === 'Enter' && active.value >= 0) {
      event.preventDefault()
      select(options.value[active.value]!)
    } else if (event.key === 'Escape') {
      dismissed.value = true
    }
  }

  return { open, active, listId, optionId, activeId, select, onKeydown }
}
