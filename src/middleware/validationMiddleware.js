const checkBodyForSpecialCharacters = (req, res, next) => {
    // Fields we want to skip
    const ignoreFields = ["imageUrl"];

    // Blocks characters often used in attacks ($, %, #, <, >, etc.)
    const specialCharRegex = /[^a-zA-Z0-9\s-',\.:/\?&_=()@]/g

    for (const key in req.body) {
        if (ignoreFields.includes(key)) continue; // Skip validation for fields we don't want to check
        const value = req.body[key];

        // Only check string values
        if (typeof value === 'string') {
            if (specialCharRegex.test(value)) {
                // If a restricted character is found, fail fast and return 400
                // console.warn(`Validation Failed: Field '${key}' contains restricted characters: ${value}`);
                return res.status(400).json({ 
                    error: "Invalid input",
                    message: `The input for '${key}' contains restricted characters ($ # @ % ^ ( ) + = !). Please remove them.`
                });
            }
        }
    }
    
    // If all checks pass, proceed to the controller
    next();
};

module.exports = { checkBodyForSpecialCharacters };