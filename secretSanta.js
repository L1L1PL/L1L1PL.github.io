// api/secretSanta.js
let names = ['Миша','Настя','Киря','Лиза','Витя','Юля'];

let forbidden = {
  'Миша': new Set(['Настя']),
  'Настя': new Set(['Миша']),
  'Киря': new Set(['Лиза']),
  'Лиза': new Set(['Киря']),
  'Витя': new Set(['Юля']),
  'Юля': new Set(['Витя'])
};
for(const n of names) forbidden[n].add(n);

let assignment = generateAssignment();

// Админ-код скрыт в serverless функции
const ADMIN_CODE = process.env.ADMIN_CODE || '098Лиза';

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

function generateAssignment(){
  const givers = shuffle([...names]);
  const recipients = new Set(names);
  const result = {};
  function backtrack(i){
    if(i>=givers.length) return true;
    const giver = givers[i];
    const options = shuffle(names.filter(r => recipients.has(r) && !forbidden[giver].has(r)));
    for(const r of options){
      result[giver] = r;
      recipients.delete(r);
      if(backtrack(i+1)) return true;
      recipients.add(r);
      delete result[giver];
    }
    return false;
  }
  return backtrack(0)?result:null;
}

export default function handler(req,res){
  const {name, code} = req.query;

  if(req.method === 'GET'){
    if(!names.includes(name)){
      return res.status(400).json({error:'Неверное имя'});
    }
    return res.json({pair:assignment[name]});
  }

  if(req.method === 'POST'){
    if(code!==ADMIN_CODE) return res.status(403).json({error:'Неверный код'});
    assignment = generateAssignment();
    return res.json({message:'Жеребьёвка обновлена!'});
  }

  res.status(405).json({error:'Метод не разрешён'});
}