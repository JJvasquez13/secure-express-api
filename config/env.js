const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const validateEnv = () => {
    const requiredVars = ['MONGO_URI', 'JWT_SECRET', 'FRONTEND_URL', 'PORT', 'NODE_ENV'];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Validate NODE_ENV
    if (!['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
        throw new Error('NODE_ENV must be either "development", "production", or "test"');
    }
};

module.exports = validateEnv;
