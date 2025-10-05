<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RunDdlSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('ddl.sql');
        DB::unprepared(file_get_contents($path));
    }
}
