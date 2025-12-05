"use client";

export default function RugbySummary({ match }: { match: any }) {
  // Rugby uses 'periods' object: { first, second, overtime, second_extra }
  // Or simply root scores if periods missing
  const periods = match.periods || {};
  const scores = match.scores || {};
  
  const home = {
    p1: periods.first?.home,
    p2: periods.second?.home,
    ot: periods.overtime?.home,
    total: scores.home
  };
  const away = {
    p1: periods.first?.away,
    p2: periods.second?.away,
    ot: periods.overtime?.away,
    total: scores.away
  };

  const renderVal = (v: any) => (v !== null && v !== undefined ? v : "-");

  return (
    <div className="p-6">
      <h3 className="text-sm font-bold text-secondary uppercase mb-4">Score Flow</h3>
      
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-center">
          <thead>
            <tr className="text-secondary border-b theme-border">
              <th className="p-2 text-left">Team</th>
              <th className="p-2">1st Half</th>
              <th className="p-2">2nd Half</th>
              <th className="p-2">OT</th>
              <th className="p-2 font-bold text-primary">Total</th>
            </tr>
          </thead>
          <tbody className="font-medium text-primary">
            <tr className="border-b theme-border">
              <td className="p-3 text-left font-bold">{match.teams.home.name}</td>
              <td className="p-3">{renderVal(home.p1)}</td>
              <td className="p-3">{renderVal(home.p2)}</td>
              <td className="p-3">{renderVal(home.ot)}</td>
              <td className="p-3 font-bold">{renderVal(home.total)}</td>
            </tr>
            <tr>
              <td className="p-3 text-left font-bold">{match.teams.away.name}</td>
              <td className="p-3">{renderVal(away.p1)}</td>
              <td className="p-3">{renderVal(away.p2)}</td>
              <td className="p-3">{renderVal(away.ot)}</td>
              <td className="p-3 font-bold">{renderVal(away.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}