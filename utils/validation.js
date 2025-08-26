const { ApiError } = require("./errorHandler");

const validateRequiredFields = (fields, data) => {
  for (const field of fields) {
    if (!data[field]) {
      throw new ApiError(400, `El campo '${field}' es obligatorio`);
    }
  }
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "El correo no es válido");
  }
};

module.exports = { validateRequiredFields, validateEmail };
