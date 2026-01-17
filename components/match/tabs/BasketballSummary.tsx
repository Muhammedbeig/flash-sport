"use client";

export default function BasketballSummary({ match }: { match: any }) {
  // Extract quarters from the match object (passed from MatchWidget)
  // Note: You need to pass the raw 'scores' object from MatchWidget to this component
  const scores = match.scores || {}; 
  const home = scores.home || {};
  const away = scores.away || {};

  return (
    <div className="p-6">
      <h3 className="text-sm font-bold text-secondary uppercase mb-4">Score Flow</h3>
      
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-center">
          <thead>
            <tr className="text-secondary border-b theme-border">
              <th className="p-2 text-left">Team</th>
              <th className="p-2">Q1</th>
              <th className="p-2">Q2</th>
              <th className="p-2">Q3</th>
              <th className="p-2">Q4</th>
              <th className="p-2">OT</th>
              <th className="p-2 font-bold text-primary">Total</th>
            </tr>
          </thead>
          <tbody className="font-medium text-primary">
            <tr className="border-b theme-border">
              <td className="p-3 text-left font-bold">{match.teams.home.name}</td>
              <td className="p-3">{home.quarter_1 ?? "-"}</td>
              <td className="p-3">{home.quarter_2 ?? "-"}</td>
              <td className="p-3">{home.quarter_3 ?? "-"}</td>
              <td className="p-3">{home.quarter_4 ?? "-"}</td>
              <td className="p-3">{home.over_time ?? "-"}</td>
              <td className="p-3 font-bold">{home.total ?? "-"}</td>
            </tr>
            <tr>
              <td className="p-3 text-left font-bold">{match.teams.away.name}</td>
              <td className="p-3">{away.quarter_1 ?? "-"}</td>
              <td className="p-3">{away.quarter_2 ?? "-"}</td>
              <td className="p-3">{away.quarter_3 ?? "-"}</td>
              <td className="p-3">{away.quarter_4 ?? "-"}</td>
              <td className="p-3">{away.over_time ?? "-"}</td>
              <td className="p-3 font-bold">{away.total ?? "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}