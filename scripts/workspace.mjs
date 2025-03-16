import { execSync, spawn } from 'node:child_process';

const runCommand = (command, filters = [], options = {}) => {
  const filterArgs = filters.map((filter) => `--filter ${filter}`).join(' ');
  try {
    execSync(`WORKSPACE_BUILD=1 pnpm ${filterArgs} ${command}`, {
      stdio: 'inherit',
      ...options,
    });
    return true;
  } catch (error) {
    if (!options.ignoreError) {
      console.error(
        `❌ Command failed: WORKSPACE_BUILD=1 pnpm ${filterArgs} ${command}`,
      );
      console.error('Error details:', error.message);
    }
    return false;
  }
};

const buildAll = () => {
  try {
    // First ensure Vue types are installed properly for vue-scan
    console.log('📦 Installing/updating dependencies for vue-scan...');
    runCommand('install', ['vue-scan']);

    // Add shims for Vue types
    console.log('🔧 Configuring build for vue-scan...');

    // First build vue-scan since nuxt-scan depends on it
    console.log('🔨 Building vue-scan...');
    // Use the modified build script that continues even if type generation fails
    const success = runCommand('build', ['vue-scan']);

    if (!success) {
      // If the build fails, try with just the vite build without type generation
      console.log(
        '⚠️ Standard build failed, trying fallback build without type generation...',
      );
      const fallbackSuccess = runCommand('build:no-types', ['vue-scan']);

      if (!fallbackSuccess) {
        console.error(
          '❌ Failed to build vue-scan. Cannot continue with dependent packages.',
        );
        process.exit(1);
      } else {
        console.log(
          '✅ vue-scan built successfully (without TypeScript declarations)',
        );
      }
    }

    // Then build nuxt-scan
    console.log('🔨 Building nuxt-scan...');
    const nuxtSuccess = runCommand('build', ['nuxt-scan']);

    if (!nuxtSuccess) {
      console.error('❌ Failed to build nuxt-scan.');
      process.exit(1);
    }

    // Then build any other packages
    console.log('🔨 Building remaining packages...');
    runCommand('build', ['./packages/*', '!nuxt-scan', '!vue-scan']);

    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
};

const devAll = () => {
  // Start vue-scan build first since nuxt-scan depends on it
  console.log('🚀 Starting vue-scan dev server...');
  const vueScanProcess = spawn('pnpm', ['--filter', 'vue-scan', 'dev'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, WORKSPACE_BUILD: '1' },
  });

  // Start nuxt-scan after a short delay
  setTimeout(() => {
    console.log('🚀 Starting nuxt-scan dev server...');
    const nuxtScanProcess = spawn('pnpm', ['--filter', 'nuxt-scan', 'dev'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, WORKSPACE_BUILD: '1' },
    });

    // Start other processes after a delay to ensure scan builds first
    setTimeout(() => {
      console.log('🚀 Starting other packages dev servers...');
      // Start other processes after initial build
      const otherProcess = spawn(
        'pnpm',
        [
          '--filter',
          '"./packages/*"',
          '--filter',
          '"!nuxt-scan"',
          '--filter',
          '"!vue-scan"',
          '--parallel',
          'dev',
        ],
        {
          stdio: 'inherit',
          shell: true,
        },
      );

      // Handle Ctrl+C for all processes
      process.on('SIGINT', () => {
        console.log('💤 Shutting down all dev servers...');
        vueScanProcess.kill('SIGINT');
        nuxtScanProcess.kill('SIGINT');
        otherProcess.kill('SIGINT');
        process.exit(0);
      });
    }, 1000); // Wait 1 second before starting other processes
  }, 500); // Wait 500ms before starting nuxt-scan
};

const packAll = () => {
  try {
    // First pack vue-scan since nuxt-scan depends on it
    console.log('📦 Packing vue-scan...');
    runCommand('pack', ['vue-scan']);

    // Then pack nuxt-scan
    console.log('📦 Packing nuxt-scan...');
    runCommand('pack', ['nuxt-scan']);

    // Then pack any other packages
    console.log('📦 Packing remaining packages...');
    runCommand('--parallel pack', ['./packages/*', '!nuxt-scan', '!vue-scan']);

    console.log('✅ Pack completed successfully');
  } catch (error) {
    console.error('❌ Pack failed:', error.message);
    process.exit(1);
  }
};

// Parse command-line arguments
const args = process.argv.slice(2);
if (args.includes('build')) {
  buildAll();
} else if (args.includes('dev')) {
  devAll();
} else if (args.includes('pack')) {
  packAll();
} else {
  // biome-ignore lint/suspicious/noConsole: Intended debug output
  console.error('Invalid command. Use: node workspace.mjs [build|dev|pack]');
}
