const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

// Cross-platform browser opening function
function openBrowser(url) {
    const platform = process.platform;
    let command;

    switch (platform) {
        case 'win32':
            command = `start ${url}`;
            break;
        case 'darwin':
            command = `open ${url}`;
            break;
        case 'linux':
            command = `xdg-open ${url}`;
            break;
        default:
            console.log(`❌ Unsupported platform: ${platform}. Please visit ${url} manually`);
            return;
    }

    exec(command, (error) => {
        if (error) {
            console.log(`❌ Could not open browser automatically. Please visit ${url} manually`);
        } else {
            console.log('✅ Browser opened successfully');
        }
    });
}

async function startProject() {
    console.log('🚀 Starting project setup...\n');

    try {
        // Step 1: Check if Bun is already installed
        console.log('🔍 Checking if Bun is installed...');
        try {
            await execPromise('bun --version');
            console.log('✅ Bun is already installed\n');
        } catch (bunError) {
            console.log('📦 Installing Bun globally...');
            await execPromise('powershell -Command "irm bun.sh/install.ps1 | iex"');
            console.log('✅ Bun installed globally\n');
        }

        // Step 2: Install dependencies
        console.log('📦 Installing dependencies...');
        await execPromise('bun install');
        console.log('✅ Dependencies installed\n');

        // Step 3: Start the development server
        console.log('🔥 Starting development server...');
        const devProcess = spawn('bun', ['run', 'dev'], {
            stdio: 'inherit',
            shell: true
        });

        // Step 4: Wait a bit for server to start, then open browser
        setTimeout(() => {
            console.log('🌐 Opening browser at http://localhost:5173/...');
            openBrowser('http://localhost:5173/');
        }, 3000);

        // Handle process termination
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down...');
            devProcess.kill();
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Error during setup:', error.message);
        process.exit(1);
    }
}

startProject();