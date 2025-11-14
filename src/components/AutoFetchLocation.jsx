/**
 * Auto-Fetch Customer Location on Checkout Page
 * 
 * Add this code to your checkout page component or create a separate component
 * This will automatically detect customer location using browser Geolocation API
 * and Google Maps Geocoding API
 */

import { useEffect } from 'react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAO5eU8fxUEYC_tK4HR7b3cNQ1o20uddv0'; // Same as shipping map
const WORDPRESS_API_URL = 'https://db.store1920.com/wp-json/custom/v1/save-customer-location';

export const AutoFetchLocation = () => {
  useEffect(() => {
    // Check if geolocation is available
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      return;
    }

    // Request location permission and get coordinates
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        console.log('📍 Location detected:', { latitude, longitude });

        try {
          // Reverse geocode to get address from Google Maps
          const geocodeResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
          );
          const geocodeData = await geocodeResponse.json();

          if (geocodeData.status === 'OK' && geocodeData.results[0]) {
            const result = geocodeData.results[0];
            const formatted_address = result.formatted_address;

            // Extract city and country
            let city = '';
            let country = '';

            result.address_components.forEach((component) => {
              if (component.types.includes('locality')) {
                city = component.long_name;
              }
              if (component.types.includes('country')) {
                country = component.long_name;
              }
            });

            console.log('📍 Address:', formatted_address);
            console.log('📍 City:', city);
            console.log('📍 Country:', country);

            // Send location to WordPress
            const saveResponse = await fetch(WORDPRESS_API_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                formatted_address,
                city,
                country,
              }),
            });

            const saveData = await saveResponse.json();

            if (saveData.success) {
              console.log('✅ Location saved to WordPress:', saveData);
              
              // Store in localStorage as backup
              localStorage.setItem('customerLocation', JSON.stringify({
                latitude,
                longitude,
                formatted_address,
                city,
                country,
                timestamp: new Date().toISOString(),
              }));
            } else {
              console.error('❌ Failed to save location:', saveData);
            }
          }
        } catch (error) {
          console.error('❌ Error geocoding location:', error);
          
          // Save coordinates only if geocoding fails
          try {
            await fetch(WORDPRESS_API_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                latitude: latitude.toString(),
                longitude: longitude.toString(),
              }),
            });
          } catch (saveError) {
            console.error('❌ Error saving coordinates:', saveError);
          }
        }
      },
      (error) => {
        // Handle location permission denied or error
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.warn('⚠️ User denied location permission');
            break;
          case error.POSITION_UNAVAILABLE:
            console.warn('⚠️ Location information unavailable');
            break;
          case error.TIMEOUT:
            console.warn('⚠️ Location request timed out');
            break;
          default:
            console.warn('⚠️ Unknown location error:', error);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  }, []);

  return null; // This component doesn't render anything
};

export default AutoFetchLocation;
