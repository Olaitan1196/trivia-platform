import Setting from '../models/Setting.js';

const getOrCreateSettings = async () => {
  let settings = await Setting.findOne();

  if (!settings) {
    settings = new Setting({});
    await settings.save();
  }

  return settings;
};

export const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();

    res.status(200).json({
      minWithdrawalAmount: settings.minWithdrawalAmount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateMinWithdrawal = async (req, res) => {
  try {
    const { minWithdrawalAmount } = req.body;

    if (minWithdrawalAmount <= 0) {
      return res.status(400).json({ message: 'Minimum withdrawal must be greater than zero' });
    }

    const settings = await getOrCreateSettings();
    settings.minWithdrawalAmount = minWithdrawalAmount;
    await settings.save();

    res.status(200).json({
      message: 'Minimum withdrawal amount updated',
      minWithdrawalAmount: settings.minWithdrawalAmount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};