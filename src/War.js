import  {React,useState} from 'react';
import { Layout, Row, Col, Button, Typography, Input } from 'antd';
import './War.css';

const { Header, Content } = Layout;
const { TextArea } = Input;
const { Title } = Typography;

const WarPanel = () => {
const [kingArmyInput, setKingArmy] = useState(
    "Spearmen#10;Militia#30;FootArcher#20;LightCavalry#1000;HeavyCavalry#120"
  );
  const [enemyArmyInput, setEnemyArmy] = useState(
    "Militia#10;Spearmen#10;FootArcher#1000;LightCavalry#120;CavalryArcher#100"
  );
    const [warStatus, setWarStatus] = useState(false);
  const [result, setResult] = useState("");
  const [details, setDetails] = useState([]);

  const advantage = {
    Militia: ["Spearmen", "LightCavalry"],
    Spearmen: ["LightCavalry", "HeavyCavalry"],
    LightCavalry: ["FootArcher", "CavalryArcher"],
    HeavyCavalry: ["Militia", "FootArcher", "LightCavalry"],
    CavalryArcher: ["Spearmen", "HeavyCavalry"],
    FootArcher: ["Militia", "CavalryArcher"],
  };


  function parsePlatoons(str) {
    return str.split(";").map((segment) => {
      const [clazz, countStr] = segment.split("#");
      return { clazz: clazz.trim(), count: Number(countStr) };
    });
  }

  function attackerHasAdvantage(attacker, defender) {
    return advantage[attacker.clazz]?.includes(defender.clazz);
  }

  function battle(attacker, defender) {
    const effective = attackerHasAdvantage(attacker, defender)
      ? attacker.count * 2
      : attacker.count;
    if (effective > defender.count) return 1; // win
    if (effective === defender.count) return 0; // draw
    return -1; // loss
  }

  
  function getAllPossibilities(arr) {
  const result = [];

  function backtrack(path, used) {
    if (path.length === arr.length) {
      result.push([...path]);
      return;
    }

    for (let i = 0; i < arr.length; i++) {
      if (used[i]) continue;

      used[i] = true;
      path.push(arr[i]);

      backtrack(path, used);

      path.pop();
      used[i] = false;
    }
  }

  backtrack([], []);
  return result;
}

  function findWinningArrangement(kingArmy, enemyArmy) {
    const allPossibilites =getAllPossibilities(kingArmy);
    for (const possibility of allPossibilites) {
      let wins = 0;
      const roundDetails = [];
      for (let i = 0; i < 5; i++) {
        const outcome = battle(possibility[i], enemyArmy[i]);
        roundDetails.push({ kingArmy: possibility[i], enemyArmy: enemyArmy[i], outcome });
        if (outcome === 1) wins++;
      }
      if (wins >= 3) {
        return { arrangement: possibility, roundDetails };
      }
    }
    return null;
  }
const startWar = () => {
  try {
    const kingArmy = parsePlatoons(kingArmyInput);
    const enemyArmy = parsePlatoons(enemyArmyInput);

    if (kingArmy.length !== 5 || enemyArmy.length !== 5) {
      setResult("Please enter exactly 5 platoons for each side.");
      setDetails([]);
      return;
    }

    setWarStatus(true);
    setResult("War begin..."); 
setDetails([]);
    // I just added below Delay to display war gif image
    setTimeout(() => {
      try {
        const outcome = findWinningArrangement(kingArmy, enemyArmy);
        setWarStatus(false);
        if (outcome) {
          const output = outcome.arrangement
            .map((p) => `${p.clazz}-${p.count}`)
            .join(";");
          setResult("War Summary");
          setDetails(outcome.roundDetails);
        } else {
          setResult("There is no chance of winning");
          setDetails([]);
        }
      } catch (err) {
        console.error(err);
        setResult("Something went wrong during calculation");
        setDetails([]);
      }
    }, 3000); 

  } catch (err) {
    console.error(err);
    setResult("Invalid input format");
    setDetails([]);
  }
};



  return (
    <Layout>
      <Header style={{ color: 'white', fontSize: 24, textAlign: 'center' }}>
        BattleGround
      </Header>

      <Content>
        <Row style={{ height: '400px' }}>
          <Col xs={24} sm={24} md={8} className="army-column left-army">
            <Title level={2} style={{ color: 'white' }}>King Army</Title>
            <TextArea 
            rows={3}
             placeholder="Gather your army"
          value={kingArmyInput}
          onChange={(e) => setKingArmy(e.target.value)} />
          </Col>

         <Col xs={24} sm={24} md={8}  className={`army-column ${warStatus? 'center-battlefield':'warBegin'}`}>
            {!warStatus && <div className="center-button">
              <Button type="primary" size="large" onClick={startWar}>
                Start War
              </Button>
            </div>}
            {result.length >0 &&
            <div>
        <p className='result'>{result}</p>
      </div>}
            {details.length > 0 && (
        <table className="w-full text-sm border-t resultTable">
          <thead>
            <tr className="text-left">
              <th className="py-2">Round</th>
              <th>Your Platoon</th>
              <th>Enemy Platoon</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {details.map((battle, idx) => (
              <tr key={idx} className={`border-t ${battle.outcome === 1 ? 'won' : battle.outcome === 0 ? 'draw' : 'loss'}`}>
                <td className="py-1 pr-2">{idx + 1}</td>
                <td className="pr-2">{`${battle.kingArmy.clazz}#${battle.kingArmy.count}`}</td>
                <td className="pr-2">{`${battle.enemyArmy.clazz}#${battle.enemyArmy.count}`}</td>
                <td className="pr-2 font-medium">
                  {battle.outcome === 1 ? "Win" : battle.outcome === 0 ? "Draw" : "Loss"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
          </Col>

          <Col xs={24} sm={24} md={8} className="army-column right-enemy">
            <Title level={2} style={{ color: 'white' }}>Enemy Army</Title>
            <TextArea rows={3} 
            placeholder="Set the enemy..."
             value={enemyArmyInput}
          onChange={(e) => setEnemyArmy(e.target.value)}
            />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default WarPanel;
