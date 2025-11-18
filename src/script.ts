

// async function checkDeepFake(imageUrl: string): Promise<boolean> {
//   const api_user = '16335105';
//   const api_secret = 'DptAiwNM3HqmbmciVkjwTiLKZRHrxcCn';

//   try {
//     const params = new URLSearchParams({
//       'url': imageUrl,
//       'models': 'genai',
//       'api_user': api_user,
//       'api_secret': api_secret,
//     });

//     const response = await fetch(`https://api.sightengine.com/1.0/check.json?${params}`);

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     //   {
//     // "status": "success",
//     // "request": {
//     //   "id": "req_jB7EKYCHBK16LH7wbb12a",
//     //   "timestamp": 1763484898.985702,
//     //   "operations": 5
//     // },
//     // "type": {
//     //   "ai_generated": 0.06
//     // },
//     // "media": {
//     //   "id": "med_jB7Eci3oTpMurCAeYvpBH",
//     //   "uri": "https://i.redd.it/08rc2cty8y1g1.png"
//     // }
//     // }
//     if (data && data.type && typeof data.type.ai_generated === 'number') {
//       const aiGeneratedScore = data.type.ai_generated;
//       return aiGeneratedScore >= 0.6;
//     }
//     return false;

//   } catch (error) {
//     console.error('Error checking deep fake:', error);
//     return false;
//   }
// }