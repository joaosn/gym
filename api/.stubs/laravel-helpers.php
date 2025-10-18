<?php
// Stub helpers for Intelephense to resolve common Laravel global functions.
// This file is for IDE only and is not loaded at runtime.

use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
use Illuminate\Contracts\View\Factory as ViewFactory;
use Illuminate\Contracts\View\View as ViewContract;
use Illuminate\Routing\UrlGenerator;
use Illuminate\Contracts\Container\Container;

if (!function_exists('response')) {
    /**
     * @param string|array|null $content
     * @param int $status
     * @param array<string,string> $headers
     * @return Response|ResponseFactory|JsonResponse|RedirectResponse
     */
    function response($content = null, int $status = 200, array $headers = []) {}
}

if (!function_exists('view')) {
    /**
     * @param string|null $view
     * @param array<string,mixed> $data
     * @param array<string,mixed> $mergeData
     * @return ViewFactory|ViewContract
     */
    function view($view = null, $data = [], $mergeData = []) {}
}

if (!function_exists('url')) {
    /**
     * @param string|null $path
     * @param mixed $extra
     * @param bool|null $secure
     * @return UrlGenerator|string
     */
    function url($path = null, $extra = [], $secure = null) {}
}

if (!function_exists('app')) {
    /**
     * @template T
     * @param class-string<T>|string|null $abstract
     * @param array<string,mixed> $parameters
     * @return (T)|Container|mixed
     */
    function app($abstract = null, array $parameters = []) {}
}

if (!function_exists('config')) {
    /**
     * @param string|array|null $key
     * @param mixed $default
     * @return mixed
     */
    function config($key = null, $default = null) {}
}

if (!function_exists('route')) {
    /**
     * @param string|null $name
     * @param mixed $parameters
     * @param bool $absolute
     * @return string|UrlGenerator
     */
    function route($name = null, $parameters = [], $absolute = true) {}
}
