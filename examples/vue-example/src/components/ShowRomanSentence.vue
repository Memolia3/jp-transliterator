<script setup lang="ts">
import { useSentence } from '../composables/useSentence';

const { getRomanSentence } = useSentence();

interface Props {
    japaneseSentence: string;
}

const props = defineProps<Props>();
</script>

<template>
    <p v-if="props.japaneseSentence">日本語入力値：{{ props.japaneseSentence }}</p>
    <p v-else>日本語入力値：入力されていません</p>
    <p v-if="props.japaneseSentence">ローマ字パターン：{{ getRomanSentence(props.japaneseSentence) }}</p>
    <p v-else>ローマ字パターン：入力されていません</p>
</template>