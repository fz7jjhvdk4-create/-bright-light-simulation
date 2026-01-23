export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Välkommen till Simuleringen
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Du är konsult hos Bright Light Solutions AB, ett LED-företag som har
          drabbats av allvarliga kvalitetsproblem. Reklamationskostnaderna har
          ökat från 1.2 till 4.8 MSEK på 18 månader.
        </p>
        <p className="text-lg text-gray-600 mb-8">
          Ditt uppdrag är att utreda problemet, identifiera rotorsakerna och
          föreslå åtgärder för att minska reklamationskostnaderna med 50%.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-yellow-800 mb-3">
            📋 Projektfakta
          </h3>
          <ul className="text-left text-gray-700 space-y-2">
            <li>• <strong>Budget:</strong> 800 000 SEK</li>
            <li>• <strong>Deadline:</strong> 6 månader</li>
            <li>• <strong>Mål:</strong> Minska reklamationskostnader med 50%</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
