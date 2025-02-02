<script setup lang="ts">
import { useSentence } from '../composables/useSentence';

const { getJapaneseSentence } = useSentence();

interface Props {
    romanSentence: string;
}

const props = defineProps<Props>();
</script>

<template>
    <p v-if="props.romanSentence">ローマ字入力値：{{ props.romanSentence }}</p>
    <p v-else>ローマ字入力値：入力されていません</p>
    <p v-if="props.romanSentence">日本語パターン：{{ getJapaneseSentence(props.romanSentence) }}</p>
    <p v-else>日本語パターン：入力されていません</p>
</template>