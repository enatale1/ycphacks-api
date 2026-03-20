const checkBodyForSpecialCharacters = (req, res, next) => {
    // Fields we want to skip
    const ignoreFields = ["imageUrl", "password"]

    // Blocks characters often used in attacks ($, %, #, <, >, etc.)
    const generalRegex = /[^a-zA-Z0-9\s-',\.:/\?&_=()@]/;

    // Blocks characters for phoneNumber (allows only digits, spaces, plus, parens, and hyphens)
    const phoneRegex = /[^0-9\s\+\-\(\)]/;

    // Blocks characters for Level of Study
    const studyRegex = /[^a-zA-Z0-9\s\/\(\)\-\+\',’]/;

    for (const key in req.body) {
        if (ignoreFields.includes(key)) continue; // Skip validation for fields we don't want to check
        const value = req.body[key];

        // Skip non-string values
       // if (typeof value !== 'string') continue;

        if(key === 'phoneNumber'){
            if(phoneRegex.test(value)){
                // Will return 400 if restricted character is found
                return res.status(400).json({
                    error: "Invalid Phone Number",
                    message: "Phone numbers should only include numbers and symbols like +, -, or ( )."
                });
            }
        }

        else if(key === 'levelOfStudy'){
            if(studyRegex.test(value)){
                // Will return 400 if restricted character for levelOfStudy is found
                return res.status(400).json({
                    error: "Invalid Level of Study",
                    message: "that aint right"
                });
            }
        }

        // Only check string values
        else if (typeof value === 'string') {
            if (generalRegex.test(value)) {
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