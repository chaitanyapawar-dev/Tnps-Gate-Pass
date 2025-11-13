const axios = require('axios').default;
const args = process.argv.slice(2);
const base = args[0] || 'http://localhost:3000';

(async ()=>{
  try{
    const resp = await axios.get(base + '/signup');
    console.log('Status:', resp.status);
    console.log('Headers:', resp.headers);
    console.log('Body snippet:', resp.data.toString().slice(0,200));
  }catch(e){
    if (e.response){
      console.error('Status:', e.response.status);
      console.error('Body snippet:', e.response.data.toString().slice(0,200));
    } else {
      console.error('Error:', e.message);
    }
    process.exit(1);
  }
})();
