const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '..', 'node_modules', 'mendix', 'custom_widget.xsd');
const targetPath = path.join(__dirname, '..', 'custom_widget.xsd');

try {
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    
    console.log('Successfully copied custom_widget.xsd to project root');
  } else {
    console.warn('custom_widget.xsd not found in node_modules/mendix');
    console.warn('Make sure mendix package is installed');
  }
} catch (error) {
  console.error('Failed to copy custom_widget.xsd:', error.message);

  process.exit(1);
}