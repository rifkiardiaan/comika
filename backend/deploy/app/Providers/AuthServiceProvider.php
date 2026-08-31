<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        \App\Models\Comic::class => \App\Policies\ComicPolicy::class,
        \App\Models\Episode::class => \App\Policies\EpisodePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
