const fs = require('fs');
const path = require('path');

const iconMap = {
    'bi-envelope': 'ph-envelope',
    'bi-person': 'ph-user',
    'bi-person-circle': 'ph-user-circle',
    'bi-lock': 'ph-lock',
    'bi-eye': 'ph-eye',
    'bi-eye-slash': 'ph-eye-slash',
    'bi-box-arrow-right': 'ph-sign-out',
    'bi-house': 'ph-house',
    'bi-speedometer2': 'ph-gauge',
    'bi-grid': 'ph-squares-four',
    'bi-people': 'ph-users',
    'bi-building': 'ph-buildings',
    'bi-chat-left-text': 'ph-chat-text',
    'bi-chat': 'ph-chat',
    'bi-file-earmark-text': 'ph-file-text',
    'bi-card-checklist': 'ph-clipboard-text',
    'bi-list': 'ph-list',
    'bi-plus': 'ph-plus',
    'bi-plus-lg': 'ph-plus',
    'bi-x': 'ph-x',
    'bi-x-lg': 'ph-x',
    'bi-x-circle': 'ph-x-circle',
    'bi-check-circle': 'ph-check-circle',
    'bi-info-circle': 'ph-info',
    'bi-exclamation-circle': 'ph-warning',
    'bi-image': 'ph-image',
    'bi-trash': 'ph-trash',
    'bi-pencil': 'ph-pencil',
    'bi-pencil-square': 'ph-pencil-simple',
    'bi-search': 'ph-magnifying-glass',
    'bi-bell': 'ph-bell',
    'bi-clock': 'ph-clock',
    'bi-geo-alt': 'ph-map-pin',
    'bi-chevron-down': 'ph-caret-down',
    'bi-arrow-right': 'ph-arrow-right',
    'bi-file-text': 'ph-file-text',
    'bi-briefcase': 'ph-briefcase',
    'bi-upload': 'ph-upload-simple',
    'bi-person-badge': 'ph-identification-card',
    'bi-envelope-at': 'ph-envelope-simple',
    'bi-phone': 'ph-phone',
    'bi-geo': 'ph-map-pin',
    'bi-camera': 'ph-camera',
    'bi-bar-chart': 'ph-chart-bar',
    'bi-pie-chart': 'ph-chart-pie',
    'bi-check': 'ph-check',
    'bi-exclamation-triangle': 'ph-warning',
    'bi-shield-lock': 'ph-shield-check'
};

const frontendDir = path.join(__dirname, 'frontend');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const bootstrapCssLink = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">';
const phosphorScript = '<script src="https://unpkg.com/@phosphor-icons/web"></script>';

walkDir(frontendDir, (filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Replace bootstrap css with phosphor script
        if (filePath.endsWith('.html')) {
            if (content.includes(bootstrapCssLink)) {
                content = content.replace(bootstrapCssLink, phosphorScript);
                modified = true;
            }
            
            // Add animations.js right before </body> if it's not there
            if (!content.includes('animations.js')) {
                // Determine relative path to assets
                const depth = filePath.split(path.sep).length - frontendDir.split(path.sep).length - 1;
                let prefix = depth === 0 ? './assets/js/' : '../'.repeat(depth) + 'assets/js/';
                content = content.replace('</body>', `<script src="${prefix}animations.js"></script>\n</body>`);
                modified = true;
            }
            
            // Add .reveal class to some main containers (like .app-frame or .page-content)
            if (content.includes('class="page-content"')) {
                content = content.replace('class="page-content"', 'class="page-content reveal"');
                modified = true;
            }
        }

        // Replace classes
        const regex = /bi\s+bi-([a-z0-9-]+)/g;
        content = content.replace(regex, (match, iconName) => {
            const mapped = iconMap[`bi-${iconName}`] || `ph-${iconName}`;
            modified = true;
            return `ph ${mapped}`;
        });

        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`Updated ${filePath}`);
        }
    }
});
