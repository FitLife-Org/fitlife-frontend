const { Project } = require('ts-morph');
const path = require('path');
const fs = require('fs');

async function main() {
  const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
  });

  // Helper to safely move a file if it exists
  const moveFile = (srcPath, destDir) => {
    const file = project.getSourceFile(srcPath);
    if (file) {
      console.log(`Moving ${srcPath} to ${destDir}`);
      file.moveToDirectory(path.resolve(destDir));
    }
  };

  const moveDirContents = (srcDir, destDir) => {
    if (!fs.existsSync(srcDir)) return;
    const files = project.getSourceFiles(srcDir + '/**/*.{ts,tsx}');
    for (const file of files) {
      console.log(`Moving ${file.getBaseName()} to ${destDir}`);
      file.moveToDirectory(path.resolve(destDir));
    }
  };

  // 1. Layouts
  console.log("Refactoring Layouts...");
  moveDirContents('src/components/layout', 'src/layouts');
  moveDirContents('src/components/guest', 'src/layouts');

  // 2. Feature Components
  console.log("Refactoring Feature Components...");
  moveFile('src/components/checkin/GymQrScanner.tsx', 'src/features/checkin/components');
  moveFile('src/pages/admin/components/GymQrManager.tsx', 'src/features/checkin/components');
  moveFile('src/pages/admin/components/GymPackageTab.tsx', 'src/features/package/components');
  moveFile('src/pages/admin/components/PackageDurationTab.tsx', 'src/features/package/components');

  // 3. Router Guards
  console.log("Refactoring Guards...");
  moveDirContents('src/components/guards', 'src/router/guards');

  // 4. Stores -> Context
  console.log("Refactoring Store -> Context...");
  moveDirContents('src/store', 'src/context');

  console.log("Saving changes (This will update all imports)...");
  await project.save();
  console.log("Done!");
}

main().catch(console.error);
