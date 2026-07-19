const { Project } = require('ts-morph');
const path = require('path');
const fs = require('fs');

async function main() {
  const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
  });

  const getFeatureName = (name) => {
    const l = name.toLowerCase();
    if (l.includes('auth')) return 'auth';
    if (l.includes('checkin') || l.includes('qr')) return 'checkin';
    if (l.includes('equipment')) return 'equipment';
    if (l.includes('invoice')) return 'invoice';
    if (l.includes('package')) return 'package';
    if (l.includes('subscription')) return 'subscription';
    if (l.includes('user') || l.includes('member') || l.includes('profile') || l.includes('account')) return 'user';
    if (l.includes('trainer')) return 'trainer';
    if (l.includes('bodymetric')) return 'bodyMetric';
    if (l.includes('dashboard')) return 'dashboard';
    if (l.includes('booking')) return 'booking';
    if (l.includes('workout')) return 'workout';
    if (l.includes('ai') && !l.includes('trainer')) return 'ai'; // 'ai' matches 'trainer' if not careful! Wait, 'ai' is in 'trainer'? No, 'aiService' -> ai. 'useTrainer' -> trainer.
    if (name.startsWith('ai')) return 'ai';
    if (l.includes('public')) return 'public';
    return null; // Global
  };

  const processDirectory = (dir, subDir) => {
    const dirPath = path.resolve(dir);
    if (!fs.existsSync(dirPath)) return;
    
    // Using native fs to find files because ts-morph getSourceFiles might not be reliable if not in tsconfig?
    // It is in tsconfig.
    const files = project.getSourceFiles(dir + '/**/*.{ts,tsx}');
    for (const file of files) {
      const baseName = file.getBaseName();
      const feature = getFeatureName(baseName);
      
      if (feature) {
        console.log(`Moving ${baseName} to features/${feature}/${subDir}`);
        file.moveToDirectory(path.resolve(`src/features/${feature}/${subDir}`));
      } else {
        // If it's uploadService.ts, move to lib
        if (baseName === 'uploadService.ts') {
          console.log(`Moving ${baseName} to lib`);
          file.moveToDirectory(path.resolve('src/lib'));
        }
      }
    }
  };

  console.log("Refactoring Services...");
  processDirectory('src/services', 'services');

  console.log("Refactoring Hooks...");
  processDirectory('src/hooks', 'hooks');

  console.log("Refactoring Types...");
  processDirectory('src/types', 'types');

  console.log("Refactoring Utils/Validators...");
  processDirectory('src/utils/validators', 'utils');

  console.log("Saving changes (This will update all imports)...");
  await project.save();
  console.log("Done!");
}

main().catch(console.error);
