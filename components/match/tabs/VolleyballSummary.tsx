"use client";

export default function VolleyballSummary({ match }: { match: any }) {
  const scores = match.scores || {}; 
  
  // Ensure sets object exists (API sometimes puts it under 'sets', sometimes flat in scores)
  // Based on doc, it is often: scores: { home: 3, away: 1, set1: {home:25, away:20}, ... }
  // Let's adapt to the standard structure we saw in Hockey/Basketball but for Sets.
  
  // Assuming data structure from API V1:
  // scores: { home: 3, away: 1 } (Sets won)
  // periods/sets: { set1: {home: 25, away: 23}, ... }
  
  // We will pass the RAW match object into this component so we can access nested set data.
  // Let's extract safely.
  const homeSets = {
    s1: match.scores?.set1?.home,
    s2: match.scores?.set2?.home,
    s3: match.scores?.set3?.home,
    s4: match.scores?.set4?.home,
    s5: match.scores?.set5?.home,
    total: match.scores?.home
  };
  const awaySets = {
    s1: match.scores?.set1?.away,
    s2: match.scores?.set2?.away,
    s3: match.scores?.set3?.away,
    s4: match.scores?.set4?.away,
    s5: match.scores?.set5?.away,
    total: match.scores?.away
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
              <th className="p-2 font-bold text-primary">Sets</th>
            </tr>
          </thead>
          <tbody className="font-medium text-primary">
            <tr className="border-b theme-border">
              <td className="p-3 text-left font-bold">{match.teams.home.name}</td>
              <td className="p-3">{renderVal(homeSets.s1)}</td>
              <td className="p-3">{renderVal(homeSets.s2)}</td>
              <td className="p-3">{renderVal(homeSets.s3)}</td>
              <td className="p-3">{renderVal(homeSets.s4)}</td>
              <td className="p-3">{renderVal(homeSets.s5)}</td>
              <td className="p-3 font-bold">{renderVal(homeSets.total)}</td>
            </tr>
            <tr>
              <td className="p-3 text-left font-bold">{match.teams.away.name}</td>
              <td className="p-3">{renderVal(awaySets.s1)}</td>
              <td className="p-3">{renderVal(awaySets.s2)}</td>
              <td className="p-3">{renderVal(awaySets.s3)}</td>
              <td className="p-3">{renderVal(awaySets.s4)}</td>
              <td className="p-3">{renderVal(awaySets.s5)}</td>
              <td className="p-3 font-bold">{renderVal(awaySets.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}