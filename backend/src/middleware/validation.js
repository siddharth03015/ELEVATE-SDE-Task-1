function validateApplication(req, res, next) {
  const { name, phone, gender, city, state } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name is required (minimum 2 characters).');
  }

  // Validate phone: 10 digits
  const phoneClean = phone ? String(phone).replace(/\D/g, '') : '';
  if (!phone || phoneClean.length !== 10) {
    errors.push('A valid 10-digit mobile number is required.');
  }

  const validGenders = ['Male', 'Female', 'Other'];
  if (!gender || !validGenders.some((g) => g.toLowerCase() === String(gender).toLowerCase())) {
    errors.push('Gender is required (Male, Female, or Other).');
  }

  if (!city || typeof city !== 'string' || city.trim().length < 2) {
    errors.push('City is required.');
  }

  if (!state || typeof state !== 'string' || state.trim().length < 2) {
    errors.push('State is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Normalize trimmed data
  req.body.name = name.trim();
  req.body.phone = phoneClean;
  req.body.gender = gender.trim();
  req.body.city = city.trim();
  req.body.state = state.trim();

  next();
}

function validateAdminLogin(req, res, next) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required',
    });
  }
  next();
}

module.exports = {
  validateApplication,
  validateAdminLogin,
};
