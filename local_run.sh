cd initiator
UPDATE_HTML=1 EXPORT_CONTRACTS=output/data/ truffle migrate
cd ../verifier
npx serve frontend
