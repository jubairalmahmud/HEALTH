// cPanel Phusion Passenger entry point
process.env.NODE_ENV = 'production';
process.env.PASSENGER_APP_ENV = 'production';

require('./dist/server.cjs');
