-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `senha_hash` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `perfil` ENUM('ADMIN', 'MEDICO', 'PACIENTE') NOT NULL DEFAULT 'PACIENTE',
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    UNIQUE INDEX `usuarios_cpf_key`(`cpf`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `especialidades` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `especialidades_nome_key`(`nome`),
    UNIQUE INDEX `especialidades_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medicos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `crm` VARCHAR(191) NOT NULL,
    `duracao_minutos` INTEGER NOT NULL DEFAULT 30,
    `usuario_id` INTEGER NOT NULL,

    UNIQUE INDEX `medicos_crm_key`(`crm`),
    UNIQUE INDEX `medicos_usuario_id_key`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pacientes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data_nascimento` DATETIME(3) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `usuario_id` INTEGER NOT NULL,

    UNIQUE INDEX `pacientes_usuario_id_key`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medicos_has_especialidade` (
    `medico_id` INTEGER NOT NULL,
    `especialidade_id` INTEGER NOT NULL,

    PRIMARY KEY (`medico_id`, `especialidade_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agenda_slots` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inicio` DATETIME(3) NOT NULL,
    `fim` DATETIME(3) NOT NULL,
    `status` ENUM('DISPONIVEL', 'OCUPADO', 'BLOQUEADO') NOT NULL DEFAULT 'DISPONIVEL',
    `medico_id` INTEGER NOT NULL,

    UNIQUE INDEX `agenda_slots_medico_id_inicio_key`(`medico_id`, `inicio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consultas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('AGENDADA', 'REALIZADA', 'CANCELADA') NOT NULL DEFAULT 'AGENDADA',
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `paciente_id` INTEGER NOT NULL,
    `medico_id` INTEGER NOT NULL,
    `agenda_slot_id` INTEGER NOT NULL,

    UNIQUE INDEX `consultas_agenda_slot_id_key`(`agenda_slot_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `medicos` ADD CONSTRAINT `medicos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pacientes` ADD CONSTRAINT `pacientes_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medicos_has_especialidade` ADD CONSTRAINT `medicos_has_especialidade_medico_id_fkey` FOREIGN KEY (`medico_id`) REFERENCES `medicos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medicos_has_especialidade` ADD CONSTRAINT `medicos_has_especialidade_especialidade_id_fkey` FOREIGN KEY (`especialidade_id`) REFERENCES `especialidades`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agenda_slots` ADD CONSTRAINT `agenda_slots_medico_id_fkey` FOREIGN KEY (`medico_id`) REFERENCES `medicos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consultas` ADD CONSTRAINT `consultas_paciente_id_fkey` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consultas` ADD CONSTRAINT `consultas_medico_id_fkey` FOREIGN KEY (`medico_id`) REFERENCES `medicos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consultas` ADD CONSTRAINT `consultas_agenda_slot_id_fkey` FOREIGN KEY (`agenda_slot_id`) REFERENCES `agenda_slots`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
