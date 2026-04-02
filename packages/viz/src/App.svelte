<script lang="ts">
  import Timeline from './lib/Timeline.svelte';
  import type { TimelineData } from './lib/types';
  import { loadTimelineFile } from './lib/fileLoader';

  let timelineData: TimelineData | null = null;
  let isLoading = false;
  let errorMessage: string | null = null;
  let isDragging = false;
  let fileInput: HTMLInputElement;

  async function handleFile(file: File) {
    isLoading = true;
    errorMessage = null;

    const result = await loadTimelineFile(file);

    if (result.success && result.data) {
      timelineData = result.data;
      errorMessage = null;
    } else {
      errorMessage = result.error || 'Failed to load timeline';
      timelineData = null;
    }

    isLoading = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragging = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
  }

  function handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }

  function openFileDialog() {
    fileInput.click();
  }
</script>

<main class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
  <div class="container mx-auto px-4 max-w-6xl">
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Timeline Builder Visualization
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Interactive timeline visualization with zoom and pan
      </p>
    </div>

    <!-- Hidden file input for accessibility -->
    <input
      bind:this={fileInput}
      type="file"
      accept=".json"
      on:change={handleFileInput}
      class="hidden"
      aria-label="Load timeline JSON file"
    />

    <!-- File loading UI -->
    {#if !timelineData && !isLoading}
      <div
        role="button"
        tabindex="0"
        class="border-4 border-dashed rounded-lg p-12 text-center transition-colors {isDragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'}"
        on:drop={handleDrop}
        on:dragover={handleDragOver}
        on:dragleave={handleDragLeave}
        on:keydown={(e) => e.key === 'Enter' && openFileDialog()}
      >
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
          Drop timeline JSON file here
        </h3>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          or
        </p>
        <button
          on:click={openFileDialog}
          class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Choose File
        </button>
        <p class="mt-4 text-xs text-gray-500 dark:text-gray-500">
          Load JSON output from timeline solver
        </p>
      </div>
    {/if}

    <!-- Loading state -->
    {#if isLoading}
      <div class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Loading timeline...</p>
      </div>
    {/if}

    <!-- Error message -->
    {#if errorMessage}
      <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div class="flex items-start">
          <svg class="h-5 w-5 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div>
            <h3 class="text-sm font-semibold text-red-900 dark:text-red-100">Error loading file</h3>
            <p class="mt-1 text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
          </div>
        </div>
        <button
          on:click={() => {
            errorMessage = null;
            timelineData = null;
          }}
          class="mt-3 px-4 py-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    {/if}

    <!-- Timeline visualization -->
    {#if timelineData}
      <div class="mb-4 flex justify-between items-center">
        <div>
          {#if timelineData.metadata.title}
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              {timelineData.metadata.title}
            </h2>
          {/if}
          {#if timelineData.metadata.description}
            <p class="text-gray-600 dark:text-gray-400">
              {timelineData.metadata.description}
            </p>
          {/if}
        </div>
        <button
          on:click={() => {
            timelineData = null;
            errorMessage = null;
          }}
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Load Different File
        </button>
      </div>

      <Timeline data={timelineData} />

      <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          How to use:
        </h3>
        <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Scroll to zoom in and out</li>
          <li>• Click and drag to pan left and right</li>
          <li>• Blue bars are anchored events (with absolute dates)</li>
          <li>• Gray bars are unanchored events (relative only)</li>
        </ul>
      </div>
    {/if}
  </div>
</main>
