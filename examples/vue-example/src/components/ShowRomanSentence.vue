<script setup lang="ts">
import { useSentence } from '../composables/useSentence';

const { getRomanSentence } = useSentence();

interface Props {
    japaneseSentence: string;
}

const props = defineProps<Props>();
</script>

<template>
    <div v-if="props.japaneseSentence">
        <p>ローマ字パターン：</p>
        <ul>
            <li v-for="(pattern, index) in getRomanSentence(props.japaneseSentence)" :key="index">
                {{ pattern }}
            </li>
        </ul>
    </div>
    <p v-else>ローマ字パターン：入力されていません</p>
</template>

<style scoped>
ul {
    text-align: left;
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 4px;
}
</style>