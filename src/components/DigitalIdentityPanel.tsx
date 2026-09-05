type DigitalIdentityPanelProps = {
  artworkId: string
  certificateId: string
  network: string
  status: string
  transactionHash: string | null
}

export default function DigitalIdentityPanel({
  artworkId,
  certificateId,
  network,
  status,
  transactionHash,
}: DigitalIdentityPanelProps) {
  return (
    <div className="bg-white rounded-lg border border-stone-200 shadow-sm p-6 mt-6">
      <h4 className="text-sm font-semibold text-ink text-terracotta mb-4">
        Digital Identity
      </h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-stone-500">Artwork ID</p>
          <p className="text-lg font-medium text-ink">{artworkId}</p>
        </div>
        <div>
          <p className="text-sm text-stone-500">Certificate</p>
          <p className="text-lg font-medium text-ink">{certificateId}</p>
        </div>
        <div>
          <p className="text-sm text-stone-500">Network</p>
          <p className="text-lg font-medium text-ink">{network}</p>
        </div>
        <div>
          <p className="text-sm text-stone-500">Status</p>
          <p className="text-lg font-medium text-ink">{status}</p>
        </div>
        <div>
          <p className="text-sm text-stone-500">Transaction</p>
          <p className="text-lg font-medium text-ink">
            {transactionHash ? (
              <a 
                href={`/orders/${transactionHash.slice(0, 8)}...${transactionHash.slice(-4)}`} 
                className="text-terracotta hover:underline"
              >
                {transactionHash.slice(0, 8)}...{transactionHash.slice(-4)}
              </a>
            ) : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}