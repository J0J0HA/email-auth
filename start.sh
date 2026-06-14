echo "Running database migrations..."
npm run db:migrate
echo "Starting server..."
if [ "$ENV" = "prod" ]; then
    node build
else
    npm run dev -- --port 3000 --host
fi
