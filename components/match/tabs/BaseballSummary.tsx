"use client";

export default function BaseballSummary({ match }: { match: any }) {
  const scores = match.scores || {}; 
  const home = scores.home || {};
  const away = scores.away || {};

  const renderInning = (val: any) => (val !== null && val !== undefined ? val : "-");

  return (
    <div className="p-6">
      <h3 className="text-sm font-bold text-secondary uppercase mb-4">Score Flow (Innings)</h3>
      
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-center">
          <thead>
            <tr className="text-secondary border-b theme-border">
              <th className="p-2 text-left">Team</th>
              {[1,2,3,4,5,6,7,8,9].map(i => <th key={i} className="p-2">{i}</th>)}
              {(home.innings?.[10] || away.innings?.[10]) && <th className="p-2">EI</th>}
              <th className="p-2 font-bold text-primary">Total</th>
            </tr>
          </thead>
          <tbody className="font-medium text-primary">
            <tr className="border-b theme-border">
              <td className="p-3 text-left font-bold">{match.teams.home.name}</td>
              {[1,2,3,4,5,6,7,8,9].map(i => (
                 <td key={i} className="p-3">{renderInning(home.innings?.[i])}</td>
              ))}
              {(home.innings?.[10] || away.innings?.[10]) && <td className="p-3">{renderInning(home.innings?.[10])}</td>}
              <td className="p-3 font-bold">{home.total ?? "-"}</td>
            </tr>
            <tr>
              <td className="p-3 text-left font-bold">{match.teams.away.name}</td>
              {[1,2,3,4,5,6,7,8,9].map(i => (
                 <td key={i} className="p-3">{renderInning(away.innings?.[i])}</td>
              ))}
              {(home.innings?.[10] || away.innings?.[10]) && <td className="p-3">{renderInning(away.innings?.[10])}</td>}
              <td className="p-3 font-bold">{away.total ?? "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}