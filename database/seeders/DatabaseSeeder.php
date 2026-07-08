<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 0. Precargar catálogos base
        $this->call([
            EstadoArchivoSeeder::class,
            TipoCarreraSeeder::class,
            TipoArchivoSeeder::class,
        ]);

        // 1. Crear Permisos
        $permissions = [
            'view_catalogos',
            'view_tipocarrera',
            'view_estadoarchivo',
            'create_archivo',
            'view_pdf',
            'view_excel',
            'view_moderacion',
            'view_notifipersonal',
            'view_notificaciones',
            'view_perfiles',
            'view_permisos',
            'view_roles',
            'view_usuarios',
            'view_estadisticas',
            'view_cosasuser',
            'interaction_archivos',
            'state_archivo',
            'replace_archivo',
            'edit_file_notify',
            'edit_perfiles',
        ];

        foreach ($permissions as $permission) {
            \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // 2. Crear Roles
        $superAdmin = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'SuperAdmin', 'guard_name' => 'web']);
        $moderador = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Moderador', 'guard_name' => 'web']);
        $estudiante = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Estudiante', 'guard_name' => 'web']);

        // 3. Asignar todos los permisos a SuperAdmin
        $superAdmin->syncPermissions($permissions);

        // 4. Asignar algunos permisos a Moderador
        $moderador->syncPermissions([
            'view_catalogos',
            'view_moderacion',
            'view_notifipersonal',
            'view_notificaciones',
            'view_perfiles',
            'state_archivo',
            'replace_archivo',
            'edit_file_notify',
            'view_cosasuser',
        ]);

        // 5. Asignar permisos a Estudiante
        $estudiante->syncPermissions([
            'create_archivo',
            'view_notifipersonal',
            'view_cosasuser',
            'interaction_archivos',
        ]);

        // 6. Crear el usuario de prueba
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        // 7. Asignar rol SuperAdmin al usuario de prueba
        $user->assignRole('SuperAdmin');
    }
}
