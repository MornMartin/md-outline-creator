import MdOutlineCreator from "./MdOutlineCreator";
(async function() {
    const argv = require('minimist')(process.argv.slice(2));
    const input = argv.input || argv.i;
    const output = argv.output || argv.o;
    new MdOutlineCreator(input, output);
    
})();
