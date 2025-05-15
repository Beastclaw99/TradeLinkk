import axios from 'axios';

const WIPAY_TEST_URL = 'https://sandbox.wipayfinancial.com';
const WIPAY_LIVE_URL = 'https://wipayfinancial.com';

// Get WiPay base URL based on environment
const getBaseUrl = () => {
  return process.env.NODE_ENV === 'production' 
    ? WIPAY_LIVE_URL 
    : WIPAY_TEST_URL;
};

// Get the API key and developer ID from environment variables
const getApiKey = () => {
  if (!process.env.WIPAY_API_KEY) {
    throw new Error('Missing WiPay API key');
  }
  return process.env.WIPAY_API_KEY;
};

const getDeveloperId = () => {
  if (!process.env.WIPAY_DEVELOPER_ID) {
    throw new Error('Missing WiPay developer ID');
  }
  return process.env.WIPAY_DEVELOPER_ID;
};

/**
 * Generate a payment URL for WiPay checkout
 * @param {Object} options Payment options
 * @param {number} options.amount Payment amount in TTD
 * @param {string} options.name Customer name
 * @param {string} options.email Customer email
 * @param {string} options.description Payment description/reason
 * @param {string} options.orderId Unique order ID for reference
 * @param {string} options.returnUrl URL to redirect after payment
 * @returns {Promise<{url: string, transactionId: string}>} Payment URL and transaction ID
 */
export async function createPayment({
  amount,
  name,
  email,
  description,
  orderId,
  returnUrl
}: {
  amount: number;
  name: string;
  email: string;
  description: string;
  orderId: string;
  returnUrl: string;
}) {
  try {
    const baseUrl = getBaseUrl();
    const apiKey = getApiKey();
    const developerId = getDeveloperId();
    
    // WiPay API endpoint for creating payments
    const endpoint = `${baseUrl}/api/checkout/create`;
    
    // Prepare the request data
    const data = new URLSearchParams();
    data.append('account_number', apiKey);
    data.append('avs', '0'); // Address verification service, 0 = disabled
    data.append('country_code', 'TT');
    data.append('currency', 'TTD');
    data.append('developer_id', developerId);
    data.append('environment', process.env.NODE_ENV === 'production' ? 'live' : 'sandbox');
    data.append('fee_structure', 'customer'); // Options: customer, merchant, or split
    data.append('order_id', orderId);
    data.append('origin', 'tradesman_app');
    data.append('total', amount.toString());
    data.append('payer_name', name);
    data.append('payer_email', email);
    data.append('reason', description);
    data.append('response_url', returnUrl);
    
    // Make the API request
    const response = await axios.post(endpoint, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Check if the request was successful
    if (response.data && response.data.status === 'success') {
      return {
        url: response.data.url,
        transactionId: response.data.transaction_id
      };
    } else {
      throw new Error(response.data?.message || 'Failed to create payment URL');
    }
  } catch (error: any) {
    console.error('WiPay payment creation error:', error.message);
    throw new Error(`WiPay error: ${error.message}`);
  }
}

/**
 * Verify payment status with WiPay
 * @param {string} transactionId WiPay transaction ID
 * @returns {Promise<{status: string, order_id: string}>} Payment status details
 */
export async function verifyPayment(transactionId: string) {
  try {
    const baseUrl = getBaseUrl();
    const apiKey = getApiKey();
    const developerId = getDeveloperId();
    
    // WiPay API endpoint for verifying payments
    const endpoint = `${baseUrl}/api/checkout/status`;
    
    // Prepare the request data
    const data = new URLSearchParams();
    data.append('account_number', apiKey);
    data.append('developer_id', developerId);
    data.append('environment', process.env.NODE_ENV === 'production' ? 'live' : 'sandbox');
    data.append('transaction_id', transactionId);
    
    // Make the API request
    const response = await axios.post(endpoint, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Check if the request was successful
    if (response.data) {
      return response.data;
    } else {
      throw new Error('Failed to verify payment status');
    }
  } catch (error: any) {
    console.error('WiPay verification error:', error.message);
    throw new Error(`WiPay verification error: ${error.message}`);
  }
}