"use client";

export default function VolleyballSummary({ match }: { match: any }) {
  const scores = match.scores || {}; 
  const periods = match.periods || {}; 

  // Safely extract Set scores (1-5)
  // Volleyball API uses 'first', 'second', 'third', 'fourth', 'fifth' keys
  const home = {
    s1: periods.first?.home,
    s2: periods.second?.home,
    s3: periods.third?.home,
    s4: periods.fourth?.home,
    s5: periods.fifth?.home,
    total: scores.home
  };
  const away = {
    s1: periods.first?.away,
    s2: periods.second?.away,
    s3: periods.third?.away,
    s4: periods.fourth?.away,
    s5: periods.fifth?.away,
    total: scores.away
  };

  const renderVal = (v: any) => (v !== null && v !== undefined ? v : "-");

  return (
    <div className="p-6">
      <h3 className="text-sm font-bold text-secondary uppercase mb-4">Set Scores</h3>
      
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-center">
          <thead>
            <tr className="text-secondary border-b theme-border">
              <th className="p-2 text-left">Team</th>
              <th className="p-2">S1</th>
              <th className="p-2">S2</th>
              <th className="p-2">S3</th>
              <th className="p-2">S4</th>
              <th className="p-2">S5</th>
              <th className="p-2 font-bold text-primary">Sets Won</th>
            </tr>
          </thead>
          <tbody className="font-medium text-primary">
            <tr className="border-b theme-border">
              <td className="p-3 text-left font-bold">{match.teams.home.name}</td>
              <td className="p-3">{renderVal(home.s1)}</td>
              <td className="p-3">{renderVal(home.s2)}</td>
              <td className="p-3">{renderVal(home.s3)}</td>
              <td className="p-3">{renderVal(home.s4)}</td>
              <td className="p-3">{renderVal(home.s5)}</td>
              <td className="p-3 font-bold">{renderVal(home.total)}</td>
            </tr>
            <tr>
              <td className="p-3 text-left font-bold">{match.teams.away.name}</td>
              <td className="p-3">{renderVal(away.s1)}</td>
              <td className="p-3">{renderVal(away.s2)}</td>
              <td className="p-3">{renderVal(away.s3)}</td>
              <td className="p-3">{renderVal(away.s4)}</td>
              <td className="p-3">{renderVal(away.s5)}</td>
              <td className="p-3 font-bold">{renderVal(away.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}