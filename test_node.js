const fs = require('fs');
try {
    fs.writeFileSync('test_node.txt', 'Hello from Node');
    console.log('File written');
} catch (e) {
    console.error(e);
}
