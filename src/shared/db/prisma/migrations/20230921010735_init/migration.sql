-- CreateEnum
CREATE TYPE "withdraws_status" AS ENUM ('pendente', 'realizado', 'cancelado', 'reprovado');

-- CreateTable
CREATE TABLE "api_request" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "request" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctrine_migration_versions" (
    "version" TEXT NOT NULL,
    "executed_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "execution_time" INTEGER,

    CONSTRAINT "doctrine_migration_versions_pkey" PRIMARY KEY ("version")
);

-- CreateTable
CREATE TABLE "messenger_messages" (
    "id" BIGSERIAL NOT NULL,
    "body" TEXT NOT NULL,
    "headers" TEXT NOT NULL,
    "queue_name" VARCHAR(190) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "available_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messenger_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_history" (
    "id" SERIAL NOT NULL,
    "referral_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "game" VARCHAR(100),
    "amount" INTEGER,
    "type" VARCHAR(100),
    "available" BOOLEAN,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_settings" (
    "id" SERIAL NOT NULL,
    "cpa" INTEGER,
    "rev_share_percent" INTEGER,
    "referral_type" VARCHAR(10),

    CONSTRAINT "referral_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "settings_json" TEXT NOT NULL,
    "ttl" INTEGER NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "wallet_id" INTEGER NOT NULL,
    "referral_id" INTEGER,
    "referral_settings_id" INTEGER,
    "username" VARCHAR(120) NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "cpa_collected" BOOLEAN,
    "is_referrer" BOOLEAN DEFAULT false,
    "born_date" DATE,
    "document" VARCHAR(30),
    "document_type" VARCHAR(20),
    "email" VARCHAR(180) NOT NULL,
    "full_name" VARCHAR(100),
    "password" VARCHAR(255),
    "phone" VARCHAR(25),
    "reset_password_token" VARCHAR(6),
    "is_bann" BOOLEAN NOT NULL DEFAULT false,
    "is_admin" BOOLEAN DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet" (
    "id" SERIAL NOT NULL,
    "balance" INTEGER,
    "bonus" DOUBLE PRECISION,
    "bet" DOUBLE PRECISION,
    "withdraw" DOUBLE PRECISION,
    "deposit" DOUBLE PRECISION,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transaction" (
    "id" SERIAL NOT NULL,
    "wallet_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "type" VARCHAR(50) NOT NULL,
    "uuid" VARCHAR(255) NOT NULL,
    "payment_id" INTEGER,
    "withdraw_id" INTEGER,

    CONSTRAINT "wallet_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "external_id" VARCHAR(255),
    "status" VARCHAR(50),
    "expiration_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "wallet_transaction_id" INTEGER,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdraws" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "txid" VARCHAR(255) NOT NULL,
    "withdraw_fee" DOUBLE PRECISION,
    "document_type" VARCHAR(10),
    "document" VARCHAR(50),
    "status" "withdraws_status" DEFAULT 'pendente',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER,
    "is_deposit" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "withdraws_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bonus" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "limit" INTEGER,
    "limit_user" INTEGER,
    "days_expire" INTEGER NOT NULL DEFAULT 7,
    "status" VARCHAR(15) NOT NULL DEFAULT 'ativo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "img_url" VARCHAR(255),
    "maximiun_deposit" INTEGER,
    "minimiun_deposit" INTEGER NOT NULL DEFAULT 100,
    "rollover_percent" INTEGER NOT NULL DEFAULT 1,
    "percentage" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "bonus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bonus_users" (
    "id" SERIAL NOT NULL,
    "bonus_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" VARCHAR(15) NOT NULL DEFAULT 'aceito',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_id" INTEGER,

    CONSTRAINT "bonus_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rollovers" (
    "id" SERIAL NOT NULL,
    "bonus_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "expected_value" INTEGER NOT NULL,
    "moviment_atual" INTEGER NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Em Aberto',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_at" TIMESTAMP(3),

    CONSTRAINT "rollovers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_request" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "password_reset_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpa_affiliated" (
    "id" SERIAL NOT NULL,
    "affiliated_id" INTEGER NOT NULL,
    "minimium_deposit" INTEGER NOT NULL,
    "maximium_deposit" INTEGER,
    "colleted_value" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cpa_affiliated_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpa_colleted" (
    "id" SERIAL NOT NULL,
    "affiliated_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "deposit" INTEGER NOT NULL,
    "colleted_value" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cpa_colleted_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "file_one" TEXT NOT NULL,
    "file_two" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "desc" TEXT,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IDX_75EA56E016BA31DB" ON "messenger_messages"("delivered_at");

-- CreateIndex
CREATE INDEX "IDX_75EA56E0E3BD61CE" ON "messenger_messages"("available_at");

-- CreateIndex
CREATE INDEX "IDX_75EA56E0FB7336F0" ON "messenger_messages"("queue_name");

-- CreateIndex
CREATE INDEX "IDX_7E9A2C6D3CCAA4B7" ON "referral_history"("referral_id");

-- CreateIndex
CREATE INDEX "IDX_7E9A2C6DA76ED395" ON "referral_history"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UNIQ_8D93D649712520F3" ON "user"("wallet_id");

-- CreateIndex
CREATE UNIQUE INDEX "UNIQ_8D93D6493E58724C" ON "user"("referral_settings_id");

-- CreateIndex
CREATE UNIQUE INDEX "UNIQ_8D93D649F85E0677" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UNIQ_8D93D649E7927C74" ON "user"("email");

-- CreateIndex
CREATE INDEX "IDX_8D93D6493CCAA4B7" ON "user"("referral_id");

-- CreateIndex
CREATE UNIQUE INDEX "UNIQ_7DAF9724C3A3BB" ON "wallet_transaction"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "UNIQ_7DAF972CD84EE37" ON "wallet_transaction"("withdraw_id");

-- CreateIndex
CREATE INDEX "IDX_7DAF972712520F3" ON "wallet_transaction"("wallet_id");

-- CreateIndex
CREATE UNIQUE INDEX "UNIQ_65D29B32924C1837" ON "payments"("wallet_transaction_id");

-- CreateIndex
CREATE INDEX "IDX_65D29B32A76ED395" ON "payments"("user_id");

-- CreateIndex
CREATE INDEX "IDX_C0CAF17A76ED395" ON "withdraws"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_request_token_key" ON "password_reset_request"("token");

-- AddForeignKey
ALTER TABLE "referral_history" ADD CONSTRAINT "FK_7E9A2C6D3CCAA4B7" FOREIGN KEY ("referral_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "referral_history" ADD CONSTRAINT "FK_7E9A2C6DA76ED395" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "FK_8D93D6493CCAA4B7" FOREIGN KEY ("referral_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "FK_8D93D6493E58724C" FOREIGN KEY ("referral_settings_id") REFERENCES "referral_settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "FK_8D93D649712520F3" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wallet_transaction" ADD CONSTRAINT "FK_7DAF9724C3A3BB" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wallet_transaction" ADD CONSTRAINT "FK_7DAF972712520F3" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wallet_transaction" ADD CONSTRAINT "FK_7DAF972CD84EE37" FOREIGN KEY ("withdraw_id") REFERENCES "withdraws"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "FK_65D29B32924C1837" FOREIGN KEY ("wallet_transaction_id") REFERENCES "wallet_transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "FK_65D29B32A76ED395" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "withdraws" ADD CONSTRAINT "FK_C0CAF17A76ED395" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bonus_users" ADD CONSTRAINT "bonus_users_bonus_id_fkey" FOREIGN KEY ("bonus_id") REFERENCES "bonus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonus_users" ADD CONSTRAINT "bonus_users_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_request" ADD CONSTRAINT "password_reset_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
