export default function AlertasPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Alertas por Telegram</h1>
      <p className="text-slate-600 mb-4">
        Recibe un aviso en Telegram cuando un producto que te interesa baje de precio.
      </p>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <ol className="list-decimal pl-5 space-y-2 text-slate-700">
          <li>
            Abre Telegram y busca el bot: <strong>@OfertasGTBot</strong> (próximamente).
          </li>
          <li>Envíale el comando <code className="bg-slate-100 px-1 rounded">/start</code>.</li>
          <li>Desde la página de un producto, presiona <em>“Avisarme”</em> para suscribirte.</li>
        </ol>
        <p className="text-xs text-slate-500">
          Las suscripciones se guardan en la base de datos y un proceso programado revisa los precios
          y envía notificaciones cuando hay bajadas.
        </p>
      </div>
    </div>
  );
}
