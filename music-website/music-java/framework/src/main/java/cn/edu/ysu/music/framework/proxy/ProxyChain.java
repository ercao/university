package cn.edu.ysu.music.framework.proxy;

import net.sf.cglib.proxy.MethodProxy;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

/**
 * @author author
 */
public class ProxyChain {
    /**
     * 目标类
     */
    private final Class<?> targetClass;

    /**
     * 目标对象
     */
    private final Object targetObject;

    /**
     * 目标方法
     */
    private final Method targetMethod;

    /**
     * 方法代理
     */
    private final MethodProxy methodProxy;

    /**
     * 方法参数
     */
    private final Object[] methodParams;

    /**
     * 代理列表
     */
    private final List<Proxy> proxyList;

    /**
     * 代理索引
     */
    private int proxyIndex = 0;

    public ProxyChain(Class<?> targetClass, Object targetObject, Method targetMethod, MethodProxy methodProxy, Object[] methodParams) {
        this(targetClass, targetObject, targetMethod, methodProxy, methodParams, new ArrayList<>());
    }

    public ProxyChain(Class<?> targetClass, Object targetObject, Method targetMethod, MethodProxy methodProxy, Object[] methodParams, List<Proxy> proxyList) {
        this.targetClass = targetClass;
        this.targetObject = targetObject;
        this.targetMethod = targetMethod;
        this.methodProxy = methodProxy;
        this.methodParams = methodParams;
        this.proxyList = proxyList;
    }

    public Class<?> getTargetClass() {
        return targetClass;
    }

    public Method getTargetMethod() {
        return targetMethod;
    }

    public Object[] getMethodParams() {
        return methodParams;
    }

    /**
     * 递归应用所有代理
     */
    public Object doProxyChain() throws Throwable {
        return proxyIndex < proxyList.size()
                ? proxyList.get(proxyIndex++).doProxy(this)
                : methodProxy.invokeSuper(targetObject, methodParams);
    }

}
