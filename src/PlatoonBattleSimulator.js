import React, { useState } from "react";

export default function PlatoonBattleSimulator() {
  const [ownInput, setOwnInput] = useState(
    "Spearmen#10;Militia#30;FootArcher#20;LightCavalry#1000;HeavyCavalry#120"
  );
  const [enemyInput, setEnemyInput] = useState(
    "Militia#10;Spearmen#10;FootArcher#1000;LightCavalry#120;CavalryArcher#100"
  );
  const [result, setResult] = useState("\u00A0");
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

  // Heap‑friendly permutation generator (iterative, no recursion needed)
  // function *permute(arr) {
  //   const n = arr.length;
  //   const c = Array(n).fill(0);
  //   let i = 0;
  //   yield arr.slice();
  //   while (i < n) {
  //     if (c[i] < i) {
  //       if (i % 2 === 0) {
  //         [arr[0], arr[i]] = [arr[i], arr[0]];
  //       } else {
  //         [arr[c[i]], arr[i]] = [arr[i], arr[c[i]]];
  //       }
  //       yield arr.slice();
  //       c[i]++;
  //       i = 0;
  //     } else {
  //       c[i] = 0;
  //       i++;
  //     }
  //   }
  // }
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

      // backtrack step
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
      const kingArmy = parsePlatoons(ownInput);
      const enemyArmy = parsePlatoons(enemyInput);
      if (kingArmy.length !== 5 || enemyArmy.length !== 5) {
        setResult("Please enter exactly 5 platoons for each side.");
        setDetails([]);
        return;
      }
      const outcome = findWinningArrangement(kingArmy, enemyArmy);
      if (outcome) {
        const output = outcome.arrangement
          .map((p) => `${p.clazz}#${p.count}`)
          .join(";");
        setResult(output);
        setDetails(outcome.roundDetails);
      } else {
        setResult("There is no chance of winning");
        setDetails([]);
      }
    } catch (err) {
      console.error(err);
      setResult("Invalid input format");
      setDetails([]);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold text-center">Platoon Battle Simulator</h2>

      <label className="flex flex-col gap-2">
        <span>Your 5 Platoons</span>
        <textarea
          className="border rounded p-2 resize-none"
          rows={2}
          value={ownInput}
          onChange={(e) => setOwnInput(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span>Enemy 5 Platoons</span>
        <textarea
          className="border rounded p-2 resize-none"
          rows={2}
          value={enemyInput}
          onChange={(e) => setEnemyInput(e.target.value)}
        />
      </label>

      <button
        className="bg-indigo-600 text-white rounded py-2 hover:bg-indigo-700 transition"
        onClick={startWar}
      >
        Simulate Battle
      </button>

      <div className="border rounded p-4 min-h-[3rem] whitespace-pre-wrap">
        {result}
      </div>

      {details.length > 0 && (
        <table className="w-full text-sm border-t">
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
              <tr key={idx} className="border-t">
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
    </div>
  );
}
